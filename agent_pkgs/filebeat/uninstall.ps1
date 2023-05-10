$return_value = 0x00
$file_beat_version = "7.16.3"

function set_filebeat_archive_name() {
    $arch = (Get-WmiObject Win32_Processor).AddressWidth
    if ($arch -eq 64){
        $Script:wlb_archive = "filebeat-$Script:file_beat_version-windows-x86_64"
    } else {
        $Script:wlb_archive = "filebeat-$Script:file_beat_version-windows-x86"
    }
}

function UninstallFilebeat() {
    Try {
        $Private:wlb_path = "C:\Program Files\$Script:wlb_archive"
        if(-Not (Test-Path -Path $Private:wlb_path) ) {
            echo "Filebeat is not installed on this system moving on."
            return $return_value
        }

        taskkill /F /IM mmc.exe
        & $Private:wlb_path\uninstall-service-filebeat.ps1
        function getWlbSvc {
            return Get-Service -Name "filebeat" 2> $null
        }

        $Private:wlb = getWlbSvc
        Write-Host -NoNewLine "Waiting for filebeat service to stop..."
        while ( $Private:wlb ) {
            $Private:wlb = getWlbSvc
            Write-Host -NoNewLine "."
            sleep 1
        }
        "done"

        Remove-Item -Path $Private:wlb_path -recurse -ErrorAction SilentlyContinue
    } Catch {
        Write-Host "Caught exception uninstalling Filebeat", $_.Exception
        $Script:return_value = 1
    }
}

set_filebeat_archive_name
UninstallFilebeat

if ($return_value -eq 0){
    echo "Successfully uninstalled Filebeat agent!"
} else {
    echo "Failed with return Code: $return_value"
}

return $return_value
