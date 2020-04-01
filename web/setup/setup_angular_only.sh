#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
FRONTEND_DIR="$SCRIPT_DIR/../"

if [ "$EUID" -ne 0 ]
  then echo "Please run as root or use sudo."
  exit
fi

pushd $SCRIPT_DIR > /dev/null
source ./common.in

_install_angular

popd > /dev/null
exit 0
