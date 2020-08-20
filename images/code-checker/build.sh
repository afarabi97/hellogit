#!/bin/bash
if [ "$EUID" -ne 0 ]
  then echo "Please run as root or use sudo."
  exit
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

pushd $SCRIPT_DIR > /dev/null

docker build -t tfplenum/code-checker:1.1 -f ./Dockerfile ../../

popd > /dev/null
