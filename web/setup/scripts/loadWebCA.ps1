
$certname="CVA/H Web CA"
$certfile="$env:userprofile\Downloads\webCA.crt"

Get-ChildItem Cert:\LocalMachine\Root | Where-Object { $_.Subject -match $certname } | Remove-Item

Invoke-WebRequest -Uri "http://controller.lan/webCA.crt" -OutFile $certfile

echo "Updating Windows root trust store"
Import-Certificate -FilePath $certfile -CertStoreLocation Cert:\LocalMachine\Root