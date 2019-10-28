$return_value = 0x00
$script_path = split-path -parent $MyInvocation.MyCommand.Definition

function _unzip() {
    param([string]$zipfile, [string]$outpath)
    $Shell = new-object -com Shell.Application
    $Shell.Namespace($outpath).copyhere($Shell.NameSpace($zipfile).Items(),4)
}

function install_endgame(){
    Set-Location -Path $Script:script_path
    Remove-Item .\linux -Recurse -ErrorAction SilentlyContinue
    Remove-Item .\windows -Recurse -ErrorAction SilentlyContinue
    Remove-Item .\macos -Recurse -ErrorAction SilentlyContinue
    Remove-Item .\solaris -Recurse -ErrorAction SilentlyContinue
    $zip_name = $(Get-ChildItem . | Where Name -match "SensorInstaller-*").name
    _unzip "$Script:script_path\$zip_name" "$Script:script_path\"
    Set-Location -Path $Script:script_path\windows\
    $installer_name = $(Get-ChildItem . | Where Name -match "-*.exe").name
    $config_name = $(Get-ChildItem . | Where Name -match "-*.cfg").name
    $my_exe = ".\$installer_name"
    $arguments = " -k {{ template_ctx.api_token }} -c $config_name"
    Start-Process $my_exe $arguments -NoNewWindow
    Set-Location -Path $Script:script_path
}

install_endgame
echo "Return Code: $return_value"
return $return_value
