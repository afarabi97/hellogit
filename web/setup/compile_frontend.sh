#!/bin/bash
if [ "$EUID" -ne 0 ]
  then echo "Please run as root or use sudo."
  exit
fi

pushd /opt/tfplenum/bootstrap/playbooks > /dev/null

make install_angular
make build_frontend_only

return_code=$(echo $?)

popd > /dev/null
exit $return_code
