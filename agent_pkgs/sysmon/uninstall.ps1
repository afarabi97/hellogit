$return_value = 0x00

function set_service_name (){
    $Script:arch = (Get-WmiObject Win32_Processor).AddressWidth
    if ($arch -eq 64){
        $Script:service_name = "Sysmon64"
    } else {
        $Script:service_name = "Sysmon"
    }
}

function uninstall_sysmon {
    Try {
        $Private:path_name = "C:\Program Files\Sysmon"
        if(Test-Path -Path $Private:path_name ) {
            & $Private:path_name\$Script:service_name.exe -u 2> $null
            Remove-Item -Path $Private:path_name -recurse
            $sysmon_service = Get-Service -Name $Script:service_name -ErrorAction SilentlyContinue
            if($sysmon_service) {
                $sysmon_service.delete()
            }
        }
    } Catch {
        Write-Host "Caught exception uninstalling Sysmon", $_.Exception
        $Script:return_value = 1
    }
}

set_service_name
uninstall_sysmon

echo "Return Code: $return_value"
return $return_value
