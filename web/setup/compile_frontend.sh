#!/bin/bash
if [ "$EUID" -ne 0 ]
  then echo "Please run as root or use sudo."
  exit
fi

pushd /opt/tfplenum/bootstrap/playbooks > /dev/null

cat <<EOF > /etc/tfplenum.ini
[tfplenum]
system_name = DIP
version = 3.4.0
EOF

make install_angular
make build_frontend_only

popd > /dev/null
exit 0
