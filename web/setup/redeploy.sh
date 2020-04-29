#!/bin/bash

if [ "$EUID" -ne 0 ]
  then echo "Please run as root or use sudo."
  exit
fi

pushd /opt/tfplenum/bootstrap/playbooks > /dev/null
make build_deploy_frontend

popd > /dev/null
