$return_value = 0x00
$winlog_beat_version = "7.15.2"

function set_winlogbeat_archive_name() {
    $arch = (Get-WmiObject Win32_Processor).AddressWidth
    if ($arch -eq 64){
        $Script:wlb_archive = "winlogbeat-$Script:winlog_beat_version-windows-x86_64"
    } else {
        $Script:wlb_archive = "winlogbeat-$Script:winlog_beat_version-windows-x86"
    }
}

function UninstallWinlogbeat() {
    $Private:wlb_path = "C:\Program Files\$Script:wlb_archive"
    if(-Not (Test-Path -Path $Private:wlb_path) ) {
        echo "Winlogbeat is not installed on this system moving on."
        exit $return_value
    }

        taskkill /F /IM mmc.exe
    & $Private:wlb_path\uninstall-service-winlogbeat.ps1
    Remove-Item -Path $Private:wlb_path -recurse -ErrorAction SilentlyContinue
}

set_winlogbeat_archive_name
UninstallWinlogbeat

if ($return_value -eq 0){
    echo "Successfully uninstalled Winlogbeat agent!"
} else {
    echo "Failed with return Code: $return_value"
}

exit $return_value
