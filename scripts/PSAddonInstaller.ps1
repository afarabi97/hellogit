
<#

.NAME: PSAddonInstaller

.SYNOPSIS: 

1. Loads powershell community modules from PSGallery repo: https://www.powershellgallery.com
2. Installs the latest stable version of powershell 7. (Lock the version of powershell that gets installed for future runs)
3. Pulls down the specific community editions powershell modules; See Line 193 or 219. (Locks the versions) (-Install option)
4. Installs all the packages pulled down. (-Install option)
5. Only pulls packages off of the net (-PullOnly option)

.EXAMPLE
    C:\PS> 
    .\PSAssonInstaller -Install (add -Verbose to see output)
    .\PSAssonInstaller -PullOnly
    .\PSAssonInstaller -InstallSaved
#>

param(

  [CmdletBinding()]
  
  [Parameter(Position=0,Mandatory=$False)]

  [switch]$Install,

  [Parameter(Position=0,Mandatory=$False)]

  [switch]$PullOnly,

  [Parameter(Position=0,Mandatory=$False)]

  [switch]$InstallSaved 
  
  )

#Checks if PS version being ran is compatible to 6+:

$ver = $PSVersionTable.PSVersion.ToString()

if(!(Test-Path "C:\temp")){New-Item -Path "C:\" -Name temp -ItemType Directory -Force | out-null}

# Installs PS7:

function installPS7 {
     
        write-verbose "Fetching PS7 Stable from github"

        $url = "https://github.com/PowerShell/PowerShell/releases/download/v7.0.0/PowerShell-7.0.0-win-x64.msi"

        $dest = "C:\temp"

        $name = "PowerShell-7.0.0-win-x64"

        $output = "$dest\$name"+".msi"


  if(!(Test-Path $output)){

        $wc = New-Object System.Net.WebClient

        $wc.DownloadFile($url, $output)

        write-verbose "Downloaded $name"
  
  }


        write-verbose -Message "Installing $name"

        msiexec /i $output /quiet /passive /norestart

        write-verbose -Message "Done"


 } 

# -InstallModules --Installs all listed packages:

function InstallModules {

    Param(
        [Parameter(ValueFromPipeline = $true)]
        [String]
        $modname,

        [string]
        $modversion
    ) 

    $i = 0

# PS Version 7 and above have different switch parameters available for the Install-Module command
# https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/import-module?view=powershell-6
  
if(($ver) -ge 6){

    Foreach($module in $modules){

        $i++

        $modname = $module.Split(":")[0] -replace ",","" -replace '"',""

        $modversion = $module.Split(":")[1] -replace ",","" -replace '"',""
 
        write-verbose -Message "Installing Module $i : $modname $modversion"

        Install-Module -Name $modname -RequiredVersion $modversion -AllowClobber -SkipPublisherCheck -Force -AllowPrerelease -AcceptLicense
    
    }
}

if(($ver) -lt 7){

# MSI Download Link and file:
# https://github.com/PowerShell/PowerShell/releases/tag/v7.0.0
# https://github.com/PowerShell/PowerShell/releases/download/v7.0.0/PowerShell-7.0.0-win-x64.msi

#Checks if PS Version > 6+ installed locally

    if(!(Test-Path 'C:\Program Files\PowerShell\7\pwsh.exe')){

        write-verbose -Message "PowerShell 7 not installed"

        installPS7

}

        Write-Warning "
        =======================================================================
    
        This terminal is running on an older version of PowerShell $Ver 
        Re-run this script with a higher version [6+].
        =======================================================================
        "

        Write-Host "Run: Start-Process 'C:\Program Files\PowerShell\7\pwsh.exe'"
        
        break;

}

}

# -PullOnly -- Saves a local copy of the modules with all dependencies:

function PullOnly {

        $count = 0

if(!(Test-Path -Path "C:\temp")){New-Item -Path "C:\" -Name "temp" -ItemType Directory -Force | out-null}

foreach ($module in $modules){

        $count++
        
        $total = $modules.count

        write-verbose -Message "Downloading $count of $total - $module"

        $modname = $module.Split(":")[0] -replace ",","" -replace '"',""

        $modversion = $module.Split(":")[1] -replace ",","" -replace '"',""

        $path = "C:\temp"
        
        Save-Module -Name $modname -RequiredVersion $modversion -Repository PSGallery `
        -Path $path -Force -AllowPrerelease -AcceptLicense

}


}

# -InstallSaved -- Installs Locally-saved modules from C:\temp:

function InstallSavedModules {

        $Source = 'C:\temp\*'

        $Dest = 'C:\Program Files (x86)\WindowsPowerShell\Modules\'

        Copy-Item $Source $Dest -recurse -exclude *.msi -Force | out-Null
        
}

#==========================================================================================#

#Line 193 gets values from array within this script/input:

$modules = @("Advanced-Threat-Analytics:0.0.12",
"ORCA:1.5.3",
"CIF3:0.7.0",
"PowerSponse:0.3.0",
"PSURLhaus:0.3.0",
"CimSweep:0.6.0.0",
"VMware.VimAutomation.Security:12.0.0.15939672",
"NTFSSecurity:4.2.6",
"xSystemSecurity:1.5.1",
"OpenSSHUtils:1.0.0.1",
"AzureRM.Security:0.2.0-preview",
"CYB3RTools:1.2.1",
"DSInternals:4.3",
"SecurityFever:2.8.1",
"Hardening:1.0.1",
"psprivilege:0.1.0",
"HAWK:1.15.0",
"AutoRuns:13.95",
"BAMCIS.OffensiveSecurity:1.0.1.3",
"PSWinReporting:1.8.1.5",
"HardenedPS:0.0.1") | sort

# ---- or ------

#Line 219 gets values from text file:

#$modules = Get-Content -Path "C:\Users\ed\Desktop\plugins.txt" -ErrorAction SilentlyContinue

#breaks if no input found:

if(!($modules)){Write-Warning "No Input from file found"; break}

#==========================================================================================#

#Gets the required dependent packages if not present:

if((Get-PackageProvider -ListAvailable | select -ExpandProperty Name) -notcontains 'NuGet'){

        Install-PackageProvider -Name NuGet -RequiredVersion 2.8.5.201 -Force

        Register-PackageSource -provider NuGet -name nugetRepository -location https://www.nuget.org/api/v2

}

if((Get-PackageProvider -ListAvailable | select -ExpandProperty Name) -notcontains 'PowerShellGet'){

        Install-PackageProvider -Name PowerShellGet -Force -AllowClobber

}

if((Get-PSRepository | select -ExpandProperty Name) -notcontains 'PSGallery'){

        Set-PSRepository -Name "PSGallery" -InstallationPolicy Trusted

}

if($Install){InstallModules}

if($PullOnly){PullOnly}

if($InstallSaved){InstallSavedModules}

