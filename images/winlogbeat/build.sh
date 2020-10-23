#!/bin/bash
if [ "$EUID" -ne 0 ]
  then echo "Please run as root or use sudo."
  exit
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

pushd $SCRIPT_DIR > /dev/null

# docker build -t tfplenum/winlogbeat-setup:7.6.2 -f 7.6.2.Dockerfile .
# docker build -t tfplenum/winlogbeat-setup:7.7.1 -f 7.7.1.Dockerfile .
# docker build -t tfplenum/winlogbeat-setup:7.8.1 -f 7.8.1.Dockerfile .
docker build -t tfplenum/winlogbeat-setup:7.9.3 -f 7.9.3.Dockerfile .
# docker build -t tfplenum/winlogbeat-setup:7.10.0 -f 7.10.0.Dockerfile .

popd > /dev/null
