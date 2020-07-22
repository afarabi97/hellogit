#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
TFPLENUM_DIR=$SCRIPT_DIR/../../
if [ "$EUID" -ne 0 ]
  then echo "Please run as root or use sudo."
  exit 2
fi

function run_cmd {
    local command="$@"
    eval $command
    local ret_val=$?
    if [ $ret_val -ne 0 ]; then
        echo "$command returned error code $ret_val"
        exit 1
    fi
}

pushd / > /dev/null
run_cmd python3 -m venv pipeline
popd > /dev/null

pushd $SCRIPT_DIR/ > /dev/null
run_cmd /pipeline/bin/pip install --upgrade pip
# cat requirements.txt | xargs -n 1 /pipeline/bin/pip install
/pipeline/bin/pip install -r requirements-centos7.txt
run_cmd /pipeline/bin/pip install pylint==2.5.3

run_cmd /pipeline/bin/pylint --rcfile=../../pylint.rc *
popd > /dev/null

exit 0
