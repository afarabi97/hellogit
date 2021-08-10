#!/bin/bash
if [ "$EUID" -ne 0 ]
  then echo "Please run as root or use sudo."
  exit
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

pushd $SCRIPT_DIR > /dev/null


while true; do
    read -p "Please input the Maxmind API key? " key
    if [[ -n "$key" ]]; then break; fi
done
docker build -t tfplenum/misp-modules:2.4.148 -f 2.4.148/Dockerfile --build-arg=MAXMIND_API_KEY=${key} ./2.4.148

popd > /dev/null
