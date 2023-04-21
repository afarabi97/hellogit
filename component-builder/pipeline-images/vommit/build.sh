#!/bin/bash
VERSION=1.0.2
PERFORM_PUSH=true

if [ "$EUID" -ne 0 ]
then echo "Please run as root or use sudo."
    exit
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

pushd $SCRIPT_DIR > /dev/null

docker build -t docker.nexus.sil.lab/tfplenum/vommit:$VERSION -f ./Dockerfile ../../../ || exit 1

if [ "$PERFORM_PUSH" = true ] ; then
    docker push docker.nexus.sil.lab/tfplenum/vommit:$VERSION
fi

popd > /dev/null
