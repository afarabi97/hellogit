#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
FRONTEND_DIR="$SCRIPT_DIR/../"

if [ "$EUID" -ne 0 ]
  then echo "Please run as root or use sudo."
  exit
fi

pushd $SCRIPT_DIR > /dev/null
source ./common.in

_deploy_angular_application
_restart_services

cp -f /opt/tfplenum/web/setup/loadWebCA.sh /var/www/html/loadWebCA.sh
popd > /dev/null
