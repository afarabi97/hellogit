$return_value = 0x00
$script_path = split-path -parent $MyInvocation.MyCommand.Definition
$file_beat_version = "7.7.1"

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

function set_auditbeat_archive_name() {
    $arch = (Get-WmiObject Win32_Processor).AddressWidth
    if ($arch -eq 64){
        $Script:wlb_archive = "auditbeat-$Script:file_beat_version-windows-x86_64"
    } else {
        $Script:wlb_archive = "auditbeat-$Script:file_beat_version-windows-x86"
    }
}

function install_auditbeat() {
    _unzip "$Script:script_path\$Script:wlb_archive.zip" "C:\Program Files\"
    $wlb_path = "C:\Program Files\$Script:wlb_archive"

    [string]$wlb_config = $wlb_path + "\auditbeat.yml"
    [string]$webCA = $wlb_path + "\ca.crt"
    [string]$clientCA = $wlb_path + "\tls.crt"
    [string]$tlsKey = $wlb_path + "\tls.key"
    [string]$modules_fld = $wlb_path + "\modules.d\"
    Copy-Item -Path .\auditbeat.yml -Destination $wlb_config  -Force
    Copy-Item -Path .\auditbeat.yml -Destination $fields_config  -Force
    Copy-Item -Path .\ca.crt -Destination $webCA  -Force
    Copy-Item -Path .\tls.crt -Destination $clientCA  -Force
    Copy-Item -Path .\tls.key -Destination $tlsKey  -Force

    Remove-Item -Path $modules_fld -recurse -ErrorAction SilentlyContinue
    Copy-Item -Force -Recurse .\modules.d\ -Destination $modules_fld

    & C:\'Program Files'\$Script:wlb_archive\install-service-auditbeat.ps1

    $wlb_service = Get-Service -Name auditbeat
    $wlb_service.Start()

    CheckService -service_name auditbeat
}

set_auditbeat_archive_name
install_auditbeat

if ($return_value -eq 0){
    echo "Successfully installed Auditbeat!"
} else {
    echo "Failed with return Code: $return_value"
}

return $return_value
