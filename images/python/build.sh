#!/bin/bash
if [ "$EUID" -ne 0 ]
  then echo "Please run as root or use sudo."
  exit
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

pushd $SCRIPT_DIR > /dev/null

docker build -t tfplenum/python:3.8.3 -f 3.8.3.Dockerfile .
docker build -t tfplenum/python:3.9.0 -f 3.9.0.Dockerfile .

popd > /dev/null
