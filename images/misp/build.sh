#!/bin/bash
if [ "$EUID" -ne 0 ]
  then echo "Please run as root or use sudo."
  exit
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

pushd $SCRIPT_DIR > /dev/null

docker build -t tfplenum/misp:2.4.120 -f 2.4.120.Dockerfile .
docker build -t tfplenum/misp:2.4.129 -f 2.4.129.Dockerfile .
docker build -t tfplenum/misp:2.4.132 -f 2.4.132.Dockerfile .
docker build -t tfplenum/misp:2.4.133 -f 2.4.133.Dockerfile .

popd > /dev/null
