#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
TFPLENUM_DIR=$SCRIPT_DIR/../../
if [ "$EUID" -ne 0 ]
  then echo "Please run as root or use sudo."
  exit
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

pushd $TFPLENUM_DIR/testing/pipeline/ > /dev/null
# runs python pylint checking
run_cmd pylint --exit-zero --rcfile=../../pylint.rc\
  *.py **/*.py\
  --msg-template="'{path}:{line}: [{msg_id}({symbol}), {obj}] {msg}'" > pylint-pipeline.txt
popd > /dev/null

exit 0
