$script_path = split-path -parent $MyInvocation.MyCommand.Definition
cd $script_path
$folders = Get-ChildItem
foreach ($folder in $folders) {
    if ($folder -ne $null -and $folder.Attributes -eq "Directory"){
        cd $folder
        if ($folder.Name -eq "endgame"){
            .\\install.ps1
        } else {
            .\\uninstall.ps1
            .\\install.ps1
        }
        cd ..
    }
}
cd $script_path
