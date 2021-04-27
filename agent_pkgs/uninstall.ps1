$return_value = 0x00
$script_path = split-path -parent $MyInvocation.MyCommand.Definition
cd $script_path
$folders = Get-ChildItem

taskkill /F /IM mmc.exe
foreach ($folder in $folders) {
    if ($folder -ne $null -and $folder.Attributes -eq "Directory"){
        cd $folder
        powershell.exe -File .\uninstall.ps1
        $return_value = $LastExitCode
        cd ..

        if ($return_value -ne 0x00){
            echo "Failed with return code: $return_value"
            break
        }
    }
}
cd $script_path
exit $return_value
