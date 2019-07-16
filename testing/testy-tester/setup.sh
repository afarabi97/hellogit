#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

if [ "$SCRIPT_DIR" != "/opt/tfplenum/testing/testy-tester" ]; then
  echo "Error: tfplenum/testing must be in /opt"
  exit 1
fi

# Default to repos for now
export TFPLENUM_BOOTSTRAP_TYPE=repos
int_testing_dir="/opt/tfplenum/testing/testy-tester"

pushd $int_testing_dir > /dev/null
source ../infrastructure/functions.sh
root_check

function setup_pip(){
rm -rf ~/.pip
mkdir ~/.pip
cat <<EOF > ~/.pip/pip.conf
[global]
index-url = http://nexus.labrepo.lan/repository/pypi/simple
trusted-host = nexus.labrepo.lan
EOF
}

function install_packages() {
  yum install epel-release -y
  yum install git unzip gcc python36 python36-devel -y
}

function setup_virtenv(){
  pushd $int_testing_dir > /dev/null
  mv ~/.pip/pip.conf ~/.pip/pip.conf.bak
  rm -rf tfp-env
  run_cmd python3.6 -m venv tfp-env
  run_cmd tfp-env/bin/pip install --upgrade pip
  popd > /dev/null
}

function install_vsphere_sdk(){
  pushd $int_testing_dir > /dev/null
  run_cmd tfp-env/bin/pip install --upgrade pip
  run_cmd tfp-env/bin/pip install --upgrade --force-reinstall -r /opt/vsphere-automation-sdk-python/requirements.txt --extra-index-url file:///opt/vsphere-automation-sdk-python/lib
  run_cmd tfp-env/bin/pip install -r ../infrastructure/requirements.txt
  mv ~/.pip/pip.conf.bak ~/.pip/pip.conf
  popd > /dev/null
}


function finish(){
  echo "==========================================="
  echo "==========================================="
  echo "testy-tester dependencies have been setup"
  echo "Run /opt/tfplenum/testing/testy-tester/tfp-env/bin/python3.6 main.py /root/VMs.yml"
  echo "==========================================="
  echo "==========================================="
}

install_packages
setup_chrome
setup_sdk
setup_virtenv
install_vsphere_sdk
install_ovftool
finish
