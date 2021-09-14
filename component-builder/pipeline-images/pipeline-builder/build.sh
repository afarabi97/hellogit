#!/bin/bash
if [ "$EUID" -ne 0 ]
  then echo "Please run as root or use sudo."
  exit
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

pushd $SCRIPT_DIR > /dev/null

if [ -z "$1" ]; then
    echo "Please pass in the nameserver IP Address so the docker image can be built."
    exit 1
fi

docker build --build-arg YUM_REPO="nameserver $1" -t docker.nexus.sil.lab/tfplenum/pipeline-builder:1.3 -f ./Dockerfile .

popd > /dev/null
