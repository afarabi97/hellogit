$return_value = 0x00
$script_path = split-path -parent $MyInvocation.MyCommand.Definition

function _unzip {
    param([string]$zipfile, [string]$outpath)
    [void] (New-Item -Path $outpath -ItemType Directory -Force)
    $Shell = new-object -com Shell.Application
    $Shell.Namespace($outpath).copyhere($Shell.NameSpace($zipfile).Items(),4)
}

function set_service_name (){
    $Script:arch = (Get-WmiObject Win32_Processor).AddressWidth
    if ($arch -eq 64){
        $Script:service_name = "Sysmon64"
    } else {
        $Script:service_name = "Sysmon"
    }
}

function CheckService([string]$service_name) {
    Sleep 1
    $svc = Get-Service -Name $service_name -ErrorAction SilentlyContinue
    if( $svc.Status -ne "Running" ) {
        $Script:return_value = 1
    }
}

function install_sysmon() {
    Try {
        _unzip "$Script:script_path\Sysmon.zip" "C:\Program Files\Sysmon"
        & C:\'Program Files'\Sysmon\$Script:service_name.exe -i -accepteula 2> $null
        CheckService -service_name $Script:service_name
    } Catch {
        Write-Host "Caught exception installing sysmon: ", $_.Exception
        $Script:return_value = 2
    }
}

set_service_name
install_sysmon

if ($return_value -eq 0){
    echo "Successfully installed Sysmon!"
} else {
    echo "Failed with return Code: $return_value"
}
return $return_value
