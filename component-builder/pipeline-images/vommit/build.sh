#!/bin/bash
VERSION=0.2

if [ "$EUID" -ne 0 ]
then echo "Please run as root or use sudo."
    exit
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

pushd $SCRIPT_DIR > /dev/null

docker build -t docker.nexus.sil.lab/tfplenum/vommit:$VERSION -f ./Dockerfile ../../../

popd > /dev/null
