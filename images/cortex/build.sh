#!/bin/bash
# if [ "$EUID" -ne 0 ]
#   then echo "Please run as root or use sudo."
#   exit
# fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

pushd $SCRIPT_DIR > /dev/null

if [ "$1" != "" ]; then
    echo "Building Cortex v$1"
    docker build -t tfplenum/cortex:$1 -f ./$1/Dockerfile ./$1/.
else
    echo "Positional parameter 1 is empty"
fi


popd > /dev/null
