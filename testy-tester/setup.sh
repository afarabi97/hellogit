#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

# Default to repos for now
export TFPLENUM_BOOTSTRAP_TYPE=repos

pushd "/opt/tfplenum-integration-testing/testy-tester" > /dev/null

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

function setup_pip(){
rm -rf ~/.pip
mkdir ~/.pip
cat <<EOF > ~/.pip/pip.conf
[global]
index-url = http://nexus.labrepo.lan/repository/pypi/simple
trusted-host = nexus.labrepo.lan
EOF
}

function setup_chrome(){
  run_cmd yum install http://yum.labrepo.lan/misc/google-chrome-stable-69.0.3497.100-1.x86_64.rpm -y
  run_cmd curl -s -o /usr/local/bin/chromedriver http://misc.labrepo.lan/chromedriver
  run_cmd chmod 755 /usr/local/bin/chromedriver
}

function setup_sdk(){
  pushd /opt > /dev/null
  run_cmd curl -s -o vsphere-automation-sdk-python.tar.gz http://misc.labrepo.lan/vsphere-automation-sdk-python.tar.gz
  run_cmd tar xf vsphere-automation-sdk-python.tar.gz
  popd > /dev/null
}

function setup_virtenv(){
  run_cmd python3.6 -m venv tfp-env
  run_cmd tfp-env/bin/pip install --upgrade pip
}

function install_requirements(){
  run_cmd tfp-env/bin/pip install --upgrade pip
  run_cmd tfp-env/bin/pip install --upgrade --force-reinstall -r /opt/vsphere-automation-sdk-python/requirements.txt --extra-index-url file:///opt/vsphere-automation-sdk-python/lib
  run_cmd tfp-env/bin/pip install -r requirements.txt
}

function finish(){
  echo "==========================================="
  echo "==========================================="
  echo "testy-tester dependencies have been setup"
  echo "Run /opt/tfplenum-integration-testing/testy-tester/tfp-env/bin/python3.6 main.py /root/VMs.yml"
  echo "==========================================="
  echo "==========================================="
}
setup_pip
setup_chrome
setup_sdk
setup_virtenv
install_requirements
finish

