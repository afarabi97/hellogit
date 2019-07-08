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
  if rpm -q google-chrome-stable > /dev/null 2>&1 ; then
    yum remove google-chrome-stable -y > /dev/null 2>&1
  fi

  cat << EOF > /etc/yum.repos.d/google-chrome.repo
[google-chrome]
name=google-chrome
baseurl=http://dl.google.com/linux/chrome/rpm/stable/x86_64
enabled=1
gpgcheck=1
gpgkey=https://dl.google.com/linux/linux_signing_key.pub
EOF

  yum clean all
  run_cmd yum install google-chrome-stable -y

  run_cmd curl -s -o chromedriver_linux64.zip https://chromedriver.storage.googleapis.com/2.46/chromedriver_linux64.zip
  run_cmd unzip -o -q chromedriver_linux64.zip -d /usr/local/bin/
  run_cmd chmod 755 /usr/local/bin/chromedriver
  rm -rf chromedriver_linux64.zip
}

function setup_sdk(){
  pushd /opt > /dev/null
  rm -rf vsphere-automation-sdk-python
  git clone https://github.com/vmware/vsphere-automation-sdk-python.git
  popd > /dev/null
}

function install_packages() {
  yum install epel-release -y
  yum install git unzip gcc python36 python36-devel -y
}

function setup_virtenv(){
  pushd $int_testing_dir > /dev/null
  rm -rf tfp-env
  run_cmd python3.6 -m venv tfp-env
  run_cmd tfp-env/bin/pip install --upgrade pip
  popd > /dev/null
}

function install_requirements(){
  pushd $int_testing_dir > /dev/null
  run_cmd tfp-env/bin/pip install --upgrade pip
  run_cmd tfp-env/bin/pip install --upgrade --force-reinstall -r /opt/vsphere-automation-sdk-python/requirements.txt --extra-index-url file:///opt/vsphere-automation-sdk-python/lib
  run_cmd tfp-env/bin/pip install -r ../infrastructure/requirements.txt
  popd > /dev/null
}

function install_ovftool(){
    pushd /root > /dev/null
    run_cmd curl -s -o VMware-ovftool-4.3.0-7948156-lin.x86_64.bundle http://misc.labrepo.lan/VMware-ovftool-4.3.0-7948156-lin.x86_64.bundle
    run_cmd bash VMware-ovftool-4.3.0-7948156-lin.x86_64.bundle
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
install_requirements
install_ovftool
finish
