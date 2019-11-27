$return_value = 0x00
$script_path = split-path -parent $MyInvocation.MyCommand.Definition
$winlog_beat_version = "7.3.1"

function _unzip() {
   param([string]$zipfile, [string]$outpath)
   $Shell = new-object -com Shell.Application
   $Shell.Namespace($outpath).copyhere($Shell.NameSpace($zipfile).Items(),4)
}

function CheckService([string]$service_name) {
    Sleep 1
    $svc = Get-Service -Name $service_name -ErrorAction SilentlyContinue
    if( $svc.Status -ne "Running" ) {
        $Script:return_value = 1
    }
}

function set_winlogbeat_archive_name() {
    $arch = (Get-WmiObject Win32_Processor).AddressWidth
    if ($arch -eq 64){
        $Script:wlb_archive = "winlogbeat-$Script:winlog_beat_version-windows-x86_64"
    } else {
        $Script:wlb_archive = "winlogbeat-$Script:winlog_beat_version-windows-x86"
    }
}

function install_winlogbeat() {
    _unzip "$Script:script_path\$Script:wlb_archive.zip" "C:\Program Files\"
    $wlb_path = "C:\Program Files\$Script:wlb_archive"

    [string]$wlb_config = $wlb_path + "\winlogbeat.yml"
    Copy-Item -Path .\winlogbeat.yml -Destination $wlb_config  -Force

    & C:\'Program Files'\$Script:wlb_archive\install-service-winlogbeat.ps1

    $wlb_service = Get-Service -Name winlogbeat
    $wlb_service.Start()

    CheckService -service_name winlogbeat
}

set_winlogbeat_archive_name
install_winlogbeat

if ($return_value -eq 0){
    echo "Successfully installed Winlogbeat!"
} else {
    echo "Failed with return Code: $return_value"
}

return $return_value
