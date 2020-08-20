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

cat <<EOF > /etc/tfplenum.ini
[tfplenum]
system_name = DIP
version = 3.4.0
EOF

pushd $TFPLENUM_DIR/web/ > /dev/null
# runs python pylint checking
run_cmd pylint --exit-zero --ignore=tests --rcfile=../pylint.rc backend/ > ./setup/pylint-backend.txt
# TODO - Add Unit Test Section python backend
popd > /dev/null

exit 0
