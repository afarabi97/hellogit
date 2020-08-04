<#
.Description
    This function will  retrieve the specified Logs from the local system and output them in evtx format before placing them in a compressed folder. Users can choose which EventLogs to query by specifying the LogType (comma separated string ONLY ADD SPACES IF IT IS APART OF THE EVENTLOGS PATH). Users can further query by date using the From  and To Parameters. If nothing is specified for these parameters, the query defaults to the beginning of today to the current moment.
.Example
    Extract and zip The Application, Security, System and Setup Event Logs into a directory named 'zipdirectory'. If that directory doesn't exist it will be made.

    Get-Log -LogType "Application,Security,System,Setup" -ZipDirectory "C:\Users\your.user\zipdirectory"
.Example
    Extract and zip The Program-Telemetry and Application Event Logs from August 23, 2020 to the current time into a directory named 'zipdirectory'. Write a detailed output to the host. If zipdirectory doesn't exist it will be made.

    .\Get-Log -LogType "Microsoft-Windows-Application-Experience/Program-Telemetry,Application" -From 20200823 -To Now -ZipDirectory "C:\Users\your.user\zipdirectory" -Explained
.Example
    Extract and zip the Application,Security and System Event Logs from the beginning of the day to the current time. Put the results in 'zipdirectory'

    .\Get-Log -LogType "Application,Security,System" -From Today -ZipDirectory "C:\Users\your.user\zipdirectory"
.Synopsis
    This function will retrieve the specified Logs from the local system and output them in evtx format before placing them in a compressed folder. This is compatible with powershell version 2.0 and greater.
#>
#Requires -Version 2.0
param(
    [CmdletBinding()]
    <#
    A single log or a list of Logs to Query (separated by spaces).
    The defaults is 'Application,Security,System,Setup'

    Get-Log2.ps1 -LogType 'Security,Microsoft-Windows-Application-Experience/Program-Telemetry'
    Get-Log -LogType "Application,Security,System,Setup"
    #>
    [Parameter(Mandatory = $false)]
    [string[]]$LogType = 'Application,Security,System,Setup',

    <#
    The date you want to start the query from. NOTE that you can specify 'Today' or a date in 'YYYYMMDD' format.

    Get-Log2.ps1 -From Today
    Get-Log2.ps1 -From '20200823'
    #>
    [Parameter(Mandatory = $False)]
    [string]$From = 'Today',

    <#
    The date you want to end the query from. NOTE that you can specify 'Now' or a date in 'YYYYMMDD' format

    Get-Log2.ps1 -To Now
    Get-Log2.ps1 -To '20200823'
    #>
    [Parameter(Mandatory = $False)]
    [string]$To = 'Now',

    # The Directory that the ZipFile will be stored in
    [Parameter(Mandatory = $true,
        ParameterSetName = "ZipDirectory",
        ValueFromPipeline = $true,
        ValueFromPipelineByPropertyName = $true)]
    [ValidateNotNullOrEmpty()]
    [string]
    $ZipDirectory,

    # Enable Verbose Output
    [Parameter(Mandatory = $False)]
    [switch]$Explained,

    # Saves both the ZIP File and the Directory the ZIP File was made from.
    [Parameter(Mandatory = $False)]
    [System.Management.Automation.SwitchParameter]
    $Save=$False

)

function CheckForAdministrator  {
    if( -Not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        Write-Error "This Script needs to be ran with Administrator Privileges. Elevate your privilege in another shell and rerun." -ErrorAction Stop
    }
}


function GetDates {
    if ($From.ToUpper() -eq 'TODAY') {
        $script:From = ((Get-Date -Format 'yyyy-MM-ddT00:00:00').ToString())
    }
    else {
        $script:From = [Datetime]::ParseExact($script:From, 'yyyyMMdd', $null)
        $script:From = ((Get-Date $script:From -Format 'yyyy-MM-ddT00:00:00').ToString())
    }

    if ($To.ToUpper() -eq 'NOW') {
        $script:To = ((Get-Date -Format 'yyyy-MM-ddTHH:mm:ss').ToString())
    }
    else {
        $script:To = [Datetime]::ParseExact($script:To, 'yyyyMMdd', $null)
        $script:To = ((Get-Date $script:To -Format 'yyyy-MM-ddTHH:mm:ss').ToString())
    }
}

function ConstructDirectories {
    Set-Variable -Name "Timestamp" -value ((get-date)).ToString("yyyy-MM-dd-THHmm") -scope script
    Set-Variable -Name "TimestampDirectory" -value "$ZipDirectory\$timestamp" -scope script
    Set-Variable -Name "EventDirectory" -value "$TimestampDirectory\windows_events" -scope script

    New-Item -Path $TimestampDirectory -type Directory -Force
    New-Item -Path $EventDirectory -type Directory -Force
}

function QueryLogs {
    if ($script:LogType -ne $null) {
        if ($script:LogType -like 'Application,Security,System,Setup') {
            Write-Host "`r`nNo LogType was specified."
            Write-Host "Parsing the default EventLogs: Application,Security,System,Setup`r`n"
        }
        foreach ($logName in ($script:LogType -split(","))) {
            $displayName=$logName
            if ($logName -like "*/*") {
                $displayName = (($logName -split("/"))[-1])
            }
            wevtutil.exe EPL $logName "$EventDirectory\$displayName.evtx" "/q:*[System[TimeCreated[@SystemTime<=`'$script:To`' and @SystemTime>=`'$script:From`']]]" /ow:true
        }
    } else {
        Write-Error -Message "LogType must not be empty. Please provide a comma separated list of Logs."
    }
}

function GetLogSizes {
    Write-Host "Queryed Log Sizes"
    Write-Host "------------------"
    foreach ($logName in ($script:LogType -split(","))) {
        if ($logName -like "*/*") {
            $logName = (($logName -split("/"))[-1])
            $evtxFile = "$EventDirectory\$logName.evtx"
        } else {
        $evtxFile = "$EventDirectory\$logName.evtx"
        }
        if (Test-Path -Path $evtxFile) {
            $evtxFileSize = Format-FileSize((Get-Item $evtxFile).Length)
            Write-Host "$evtxFile has a size of $evtxFileSize"
        }
        else {
            Write-Host "$evtxFile does not exist!"
        }
    }
}

Function Format-FileSize() {
    Param ([int]$size)
    If ($size -gt 1TB) { [string]::Format("{0:0.00} TB", $size / 1TB) }
    ElseIf ($size -gt 1GB) { [string]::Format("{0:0.00} GB", $size / 1GB) }
    ElseIf ($size -gt 1MB) { [string]::Format("{0:0.00} MB", $size / 1MB) }
    ElseIf ($size -gt 1KB) { [string]::Format("{0:0.00} kB", $size / 1KB) }
    ElseIf ($size -gt 0) { [string]::Format("{0:0.00} B", $size) }
    Else { "" }
}

function PerformZip {
    Set-Variable -Name "ZipPath" -value "$ZipDirectory/${Timestamp}_windows_events.zip" -scope script
    if ("$($PSVersionTable.PSVersion)" -ge 4.0) {
        Compress-Archive -Path "$TimestampDirectory" -DestinationPath "$ZipPath" -Force
    } else {
        ZipFileCompat
    }
    # In a perfect world we would have a super simple script to do this but, we don't
    # live in that world. The following is Powershell 4 and upward compatible
    # Compress-Archive -Path "$TimestampDirectory" -DestinationPath "$ZipPath" -Force
}



function ZipFileCompat {
    if ($null -ne $ZipPath) {

        #Prepare zip file
        if(-not (test-path($ZipPath))) {
            set-content $ZipPath ("PK" + [char]5 + [char]6 + ("$([char]0)" * 18))
            (Get-ChildItem $ZipPath).IsReadOnly = $false
        }

        # This part is pretty error prone. Just silently continue and
        # we'll check afterwards

        ###### START PRONE TO ERROR SECTION ######
        $ErrorActionPreference = "SilentlyContinue"

        $shellApplication = new-object -com shell.application
        $zipPackage = $shellApplication.NameSpace($ZipPath)
        $files = Get-ChildItem -Path $TimestampDirectory | Where-Object{! $_.PSIsContainer}

        foreach($file in $files) {
            $zipPackage.CopyHere($file.FullName)
            #using this method, sometimes files can be 'skipped'
            #this 'while' loop checks each file is added before moving to the next
            while($null -eq $zipPackage.Items().Item($file.name)) {
                Start-sleep -seconds 1
            }
        }

        $ErrorActionPreference = "Continue"
        ###### END PRONE TO ERROR SECTION ######
    }
}

function OpenZipDirectory {
    if ($ZipPath) {
        explorer.exe "$ZipDirectory"
    }
}

function Cleanup {
    if ( -not $script:Save -and ($null -ne $script:ZipPath)) {
        Remove-Item $script:TimestampDirectory -Recurse -Force
    } else {
        Write-Host "Saving the original directory: $script:TimestampDirectory"
    }
}

function DisplayInformation {
    if ($Explained) {
        Write-Host ""
        Write-Host "Finished Retrieving Windows Event Logs"
        Write-Host "--------------------------------------"
        Write-Host "ZIP File Location: $ZipPath"
        Write-Host ""
        GetLogSizes
        OpenZipDirectory
    }
    else {
        Write-Host "ZIP File Location: $ZipPath"
    }
}

CheckForAdministrator
GetDates
ConstructDirectories
QueryLogs
PerformZip
DisplayInformation
Cleanup
