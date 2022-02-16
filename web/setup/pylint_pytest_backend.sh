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

pushd / > /dev/null
# runs python pylint checking
run_cmd /usr/local/bin/pylint --exit-zero --ignore=tests --rcfile=$PATH_PWD/pylint.rc\
  $PATH_PWD/web/backend/*.py $PATH_PWD/web/backend/**/*.py\
  --msg-template="'{path}:{line}: [{msg_id}({symbol}), {obj}] {msg}'" > $PATH_PWD/web/backend/pylint-backend.txt
# TODO - Add Unit Test Section python backend
popd > /dev/null

exit 0
