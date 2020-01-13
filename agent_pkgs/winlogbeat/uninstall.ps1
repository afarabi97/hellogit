$return_value = 0x00
$winlog_beat_version = "7.5.0"

function set_winlogbeat_archive_name() {
    $arch = (Get-WmiObject Win32_Processor).AddressWidth
    if ($arch -eq 64){
        $Script:wlb_archive = "winlogbeat-$Script:winlog_beat_version-windows-x86_64"
    } else {
        $Script:wlb_archive = "winlogbeat-$Script:winlog_beat_version-windows-x86"
    }
}

function UninstallWinlogbeat() {
    Try {
        $Private:wlb_path = "C:\Program Files\$Script:wlb_archive"
        if(-Not (Test-Path -Path $Private:wlb_path) ) {
            echo "Winlogbeat is not installed on this system moving on."
            return $return_value
        }

        & $Private:wlb_path\uninstall-service-winlogbeat.ps1

        function getWlbSvc {
            return Get-Service -Name "winlogbeat" 2> $null
        }

        $Private:wlb = getWlbSvc
        Write-Host -NoNewLine "Waiting for winlogbeat service to stop..."
        while ( $Private:wlb ) {
            $Private:wlb = getWlbSvc
            Write-Host -NoNewLine "."
            sleep 1
        }
        "done"

        Remove-Item -Path $Private:wlb_path -recurse -ErrorAction SilentlyContinue
    }Catch {
        Write-Host "Caught exception uninstalling Winlogbeat", $_.Exception
        $Script:return_value = 1
    }
}

set_winlogbeat_archive_name
UninstallWinlogbeat

if ($return_value -eq 0){
    echo "Successfully uninstalled Winlogbeat agent!"
} else {
    echo "Failed with return Code: $return_value"
}

return $return_value
