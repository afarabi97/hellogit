$return_value = 0x00
$file_beat_version = "7.13.1"

function set_auditbeat_archive_name() {
    $arch = (Get-WmiObject Win32_Processor).AddressWidth
    if ($arch -eq 64){
        $Script:wlb_archive = "auditbeat-$Script:file_beat_version-windows-x86_64"
    } else {
        $Script:wlb_archive = "auditbeat-$Script:file_beat_version-windows-x86"
    }
}

function UninstallAuditbeat() {
    Try {
        $Private:wlb_path = "C:\Program Files\$Script:wlb_archive"
        if(-Not (Test-Path -Path $Private:wlb_path) ) {
            echo "Auditbeat is not installed on this system moving on."
            return $return_value
        }

        taskkill /F /IM mmc.exe
        & $Private:wlb_path\uninstall-service-auditbeat.ps1
        function getWlbSvc {
            return Get-Service -Name "auditbeat" 2> $null
        }

        $Private:wlb = getWlbSvc
        Write-Host -NoNewLine "Waiting for auditbeat service to stop..."
        while ( $Private:wlb ) {
            $Private:wlb = getWlbSvc
            Write-Host -NoNewLine "."
            sleep 1
        }
        "done"

        Remove-Item -Path $Private:wlb_path -recurse -ErrorAction SilentlyContinue
    } Catch {
        Write-Host "Caught exception uninstalling Auditbeat", $_.Exception
        $Script:return_value = 1
    }
}

set_auditbeat_archive_name
UninstallAuditbeat

if ($return_value -eq 0){
    echo "Successfully uninstalled Auditbeat agent!"
} else {
    echo "Failed with return Code: $return_value"
}

return $return_value
