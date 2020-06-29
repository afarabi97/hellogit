$script_path = split-path -parent $MyInvocation.MyCommand.Definition
cd $script_path
$folders = Get-ChildItem

taskkill /F /IM mmc.exe
foreach ($folder in $folders) {
    if ($folder -ne $null -and $folder.Attributes -eq "Directory"){
        cd $folder
        .\uninstall.ps1
        cd ..
    }
}
cd $script_path
