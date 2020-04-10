#!/bin/bash
certname="CVA/H Web CA"
certfile="/tmp/webCA.crt"

# if [ "$EUID" -ne 0 ]
#   then echo "Please run as root or use sudo."
#   exit
# fi
curl http://controller.lan/webCA.crt -o "${certfile}"

echo "Updating CentOS root trust store"
sudo cp ${certfile} /etc/pki/ca-trust/source/anchors/webCA.crt
sudo /bin/update-ca-trust

echo "Updating browsers root trust stores"
for certDB in $(find ~/ -name "cert9.db")
do
  echo "Updating $certDB"
  certdir=$(dirname ${certDB})
  echo "Deleting previous CA"
  certutil -D -n "${certname}" -d sql:${certdir}
  echo "Adding new CA"
  certutil -A -n "${certname}" -t "TCu,Cu,Tc" -i "${certfile}" -d sql:${certdir}
done
