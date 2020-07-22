#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

if [ "$SCRIPT_DIR" != "/opt/tfplenum/testing/testy-tester" ]; then
  echo "Error: tfplenum/testing must be in /opt"
  exit 1
fi

# Default to repos for now
export TFPLENUM_BOOTSTRAP_TYPE=repos
int_testing_dir="/opt/tfplenum/testing/testy-tester"

# pushd $int_testing_dir > /dev/null
source ../infrastructure/functions.sh

function setup_ansible(){
    yum -y install centos-release-ansible-29
    yum -y install ansible make
    yum install epel-release npm
    ln -s /usr/bin/npm /usr/local/bin/npm
}


root_check

# popd > /dev/null
