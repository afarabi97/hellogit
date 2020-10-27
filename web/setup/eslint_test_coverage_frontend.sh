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

pushd $TFPLENUM_DIR/web/frontend/ > /dev/null
# runs eslint checking
run_cmd npm run lint-pipeline
# default run unit-test with chromeheadless else try firefoxheadless
run_cmd npm run test-ci-chromeheadless || npm run test-ci-firefoxheadless
popd > /dev/null

exit 0
