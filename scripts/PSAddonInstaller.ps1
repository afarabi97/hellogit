
#.NAME: PSAddonInstaller

# SYNOPSIS:

#1	Loads powershell community modules from PSGallery repo: https://www.powershellgallery.com
#2	Installs the latest stable version of powershell 7 if not already present.
#3	Pulls down the specific community editions powershell modules; See Line 83 - Input Section.
#4	Installs all the packages pulled down. (-Install option)
#5	Only pulls packages off of the net (-PullOnly option)

# NOTES:

#    List of community Powershell modules was identified as needed within the MIP's Win 10 Virtual machine.

#    Identifies PS Community Modules - https://jira.di2e.net/browse/THISISCVAH-5172
#    Creation of Script - https://jira.di2e.net/browse/THISISCVAH-5388
#    Integrates PSAddonInstaller.ps1 to GitLab pipeleine - https://jira.di2e.net/browse/THISISCVAH-5389

# EXAMPLE:

#    C:\PS>
#	.\PSAssonInstaller -Install (add -Verbose to see output)

#	 Optional parameters:
#   .\PSAssonInstaller -PullOnly # Pulls modules to a local /tmp or c:\temp (depending on host)
#	.\PSAssonInstaller -InstallSaved # Installs modules pulled from /tmp or c:\temp (depending on host)


param(
	[CmdletBinding()]

	[Parameter(Mandatory=$False)]
	[switch]$Install,

	[Parameter(Mandatory=$False)]
	[switch]$PullOnly,

	[Parameter(Mandatory=$False)]
	[switch]$InstallSaved,

	[Parameter(Mandatory=$False)]
	[string]$T_Root="",

	[Parameter(Mandatory=$False)]
	[string]$T_Dir="",

	[Parameter(Mandatory=$False)]
	[string]$PWSH="",

	[Parameter(Mandatory=$False)]
	[string]$PWSH_PATH="",

	[Parameter(Mandatory=$False)]
	[string]$Module_Destination="",

	[Parameter(Mandatory=$False)]
	[string]$PWSH_MODULE_PATH="",

	[Parameter(Mandatory=$False)]
	[switch]$Linux_Usage
)

#==========================================================================================#
#                  Gets the required dependent packages if not present:
#==========================================================================================#

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

#==========================================================================================#
# 								Input Validation
#==========================================================================================#

#Make sure only one of "-Install", "-PullOnly" or "-InstallSaved" is specified

if ((!$Install) -and (!$PullOnly) -and (!$InstallSaved)) {
	write "One of the options, -Install, -PullOnly or -InstallSaved, must be specified"
	break
}
if (($Install -and ($PullOnly -or $InstallSaved)) -or
    ($PullOnly -and ($Install -or $InstallSaved)) -or
    ($InstallSaves -and ($Install -or $PullOnly))) {
	write "The options of -Install, -PullOnly and -InstallSaved, are mutually exclusive."
	write "Only one of these options can be specified on the command line."
	break
}

#Checks if PS version being ran is compatible to 6+:

$ver = $PSVersionTable.PSVersion.ToString()

#Setup Defaults as necessary....

if ($Linux_Usage) {
	$MSI_Extension			= ".rpm"
	$Slash				= "/"
	if (!$Module_Destination) {
		$Module_Destination	= "/usr/local/share/powershell/Modules/"
	}
	if (!$T_Root) {
		$T_Root			= "/tmp"
	}
	if (!$T_Dir) {
		$T_Dir			= "pwsh"
	}
	if (!$PWSH_MODULE_PATH) {
		$PWSH_MODULE_PATH	= "$T_Root" + "$Slash" + "$T_Dir"
	}
	if (!$PWSH_PATH) {
		$PWSH_PATH		= "/bin/pwsh"
	}
	if (!$PWSH) {
		$PWSH			= "powershell-7.1.3-1.centos.8.x86_64"
	}
} else {
	$MSI_Extension			= ".msi"
	$Slash				= "\"
	if (!$Module_Destination) {
		$Module_Destination	= "C:\Program Files\PowerShell\Modules\"
	}
	if (!$T_Root) {
		$T_Root			= "C:"
	}
	if (!$T_Dir) {
		$T_Dir			= "temp"
	}
	if (!$PWSH_MODULE_PATH) {
		$PWSH_MODULE_PATH	= "$T_Root" + "$Slash" + "$T_Dir"
	}
	if (!$PWSH_PATH) {
		$PWSH_PATH		= "C:\Program Files\PowerShell\7\pwsh.exe"
	}
	if (!$PWSH) {
		$PWSH			= "PowerShell-7.1.3-win-x64"
	}
}
$TEMP					= "$T_Root" + "$Slash" + "$T_Dir"
$Module_Source				= "$TEMP" + "$Slash" + "*"

if ($PWSH_MODULE_PATH) {
	$Module_Source			= "$PWSH_MODULE_PATH" + "$Slash" + "*"
}

if(!(Test-Path "$TEMP")){
	New-Item -Path "$T_Root" -Name "$T_Dir" -ItemType Directory -Force | Out-Null
}

# Installs PS7:

function installPS7 {
	write-verbose "Fetching PS7 Stable from github"
	$url = "https://github.com/PowerShell/PowerShell/releases/download/v7.1.3/$PWSH" + "$MSI_Extension"
	$dest = "$TEMP"
	$name = "$PWSH"
	$output = "$dest" + "$Slash" + "$name" + "$MSI_Extension"
	if(!(Test-Path $output)){
		write-verbose "Downloading $name"
		$wc = New-Object System.Net.WebClient
		$wc.DownloadFile($url, $output)
	}
	write-verbose -Message "Installing $name"
	if ($Linux_Usage) {
		iex yum localinstall --assumeyes "$output"
	} else {
		$ps	= Start-Process -Wait "msiexec.exe" -PassThru -ArgumentList "/i $output /quiet /passive /norestart"
	}
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
			Install-Module -Scope AllUsers -Name $modname -RequiredVersion $modversion -AllowClobber
				-SkipPublisherCheck -Force -AllowPrerelease -AcceptLicense | Out-Null
		}
	}

	if(($ver) -lt 7){

# MSI Download Link and file:
# https://github.com/PowerShell/PowerShell/releases/tag/v7.1.3
# https://github.com/PowerShell/PowerShell/releases/download/v7.1.3/PowerShell-7.1.3-win-x64.msi

#Checks if PS Version > 6+ installed locally

		if(!(Test-Path '$PWSH_PATH')){
			write-verbose -Message "PowerShell 7 not installed"
			installPS7
		}
		Write-Warning "
=======================================================================
This terminal is running on an older version of PowerShell $Ver
Re-run this script with a higher version [6+].
=======================================================================
"
		Write-Host "Run: Start-Process '$PWSH_PATH'"    #'C:\Program Files\PowerShell\7\pwsh.exe'"
		break;
	}
}

# -PullOnly -- Saves a local copy of the modules with all dependencies:

function PullOnly {
	$count = 0
	if(!(Test-Path -Path "$TEMP")){
		New-Item -Path "$T_Root" -Name "$T_Dir" -ItemType Directory -Force | Out-Null
	}

	$total = $modules.count
	foreach ($module in $modules){
		$count++
		write-verbose -Message "Downloading $count of $total - $module"
		$modname = $module.Split(":")[0] -replace ",","" -replace '"',""
		$modversion = $module.Split(":")[1] -replace ",","" -replace '"',""
		$path = "$TEMP"
		Save-Module -Name $modname -RequiredVersion $modversion -Repository PSGallery `
			-Path "$path" -Force -AllowPrerelease -AcceptLicense | Out-Null
	}
}

# -InstallSaved -- Installs Locally-saved modules from C:\temp:

function InstallSavedModules {
	$Source		= "$Module_Source"		#'C:\temp\*'
	$Destination	= "$Module_Destination"		#'C:\Program Files\PowerShell\Modules\'
	if (!(Test-Path -Path "$Destination")) {
		New-Item -Path "$Destination" -ItemType Directory -Force | Out-Null
	}
	Copy-Item "$Source" -d "$Destination" -recurse -exclude *.msi -Force | Out-Null
}


#==========================================================================================#

# Next set of lines gets values from array within this script/input:

$modules = @(
	"Advanced-Threat-Analytics:0.0.12",
	"AutoRuns:13.98.1",
	"Az.Accounts:2.2.8",
	"Az.Security:0.10.0",
	"AzureAD:2.0.2.130",
	"BAMCIS.Common:1.0.4.0",
	"BAMCIS.DynamicParam:1.0.0.0",
	"BAMCIS.Logging:1.0.0.2",
	"BAMCIS.Networking:1.0.0.1",
	"BAMCIS.OffensiveSecurity:1.0.1.3",
	"BAMCIS.TokenManipulation:1.0.0.1",
	"BAMCIS.UserAccounts:1.0.1",
	"CIF3:0.9.5",
	"CimSweep:0.6.0.0",
	"CloudConnect:1.1.2",
	"ComputerManagementDsc:8.5.0-preview0001",
	"CYB3RTools:2.2.1",
	"DSInternals:4.4.1",
	"ESENT:1.0.0.1",
	"ExchangeOnlineManagement:2.0.5-Preview1",
	"FileSystemDsc:1.2.0-preview0002",
	"HardenedPS:0.0.1",
	"Hardening:1.0.1",
	"HAWK:2.0.1",
	"MSOnline:1.1.183.57",
	"NTFSSecurity:4.2.6",
	"ORCA:1.10.6",
	"powershell-yaml:0.4.2",
	"PowerSponse:0.3.0",
	"PSAppInsights:0.9.6",
	"PSEventViewer:1.0.17",
	"PSFramework:1.6.198",
	"psprivilege:0.1.0",
	"PSURLhaus:0.4.0",
	"PSWinReportingV2:2.0.20",
	"PSWriteExcel:0.1.12",
	"PSWriteHTML:0.0.148",
	"RobustCloudCommand:2.0.0",
	"SecurityFever:2.8.1",
	"VMware.Vim:7.0.2.17839075",
	"VMware.VimAutomation.Cis.Core:12.3.0.17839331",
	"VMware.VimAutomation.Common:12.3.0.17838947",
	"VMware.VimAutomation.Core:12.3.0.17839688",
	"VMware.VimAutomation.Sdk:12.2.0.17531155",
	"VMware.VimAutomation.Security:12.3.0.17833870",
	"VMware.VimAutomation.Storage:12.3.0.17855705") | sort

# ---- or ------

#Nest set of line gets values from text file:

#$modules = Get-Content -Path "C:\Users\ed\Desktop\plugins.txt" -ErrorAction SilentlyContinue

#breaks if no input found:

if(!($modules)){
	Write-Warning "No Input from file found"
	break
}

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

if($Install){
	InstallModules
}

if($PullOnly){
	PullOnly
}

if($InstallSaved){
	InstallSavedModules
}
