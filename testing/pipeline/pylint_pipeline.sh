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

pushd $SCRIPT_DIR/ > /dev/null
# runs python pylint checking
run_cmd pylint --exit-zero --rcfile=../../pylint.rc * > pylint-pipeline.txt
popd > /dev/null

exit 0
