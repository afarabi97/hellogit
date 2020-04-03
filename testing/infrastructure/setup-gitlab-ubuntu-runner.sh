#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
pushd $SCRIPT_DIR > /dev/null

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

function update_system_pkgs {
    run_cmd apt-get update -y
    run_cmd apt-get install open-vm-tools perl curl python3.6 python3-pip -y
}

function setup_gitlab_runner {
    run_cmd curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh | sudo bash
    run_cmd sudo apt-get install gitlab-runner

    mkdir -p /etc/gitlab-runner/certs/
    run_cmd openssl s_client -showcerts -connect gitlab.sil.lab:443 </dev/null | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > /etc/gitlab-runner/certs/gitlab.sil.lab.crt
    run_cmd gitlab-ci-multi-runner register
}

function install_requirements(){
  run_cmd pip3 install --upgrade pip
  run_cmd pip3 install -r ../pipeline/requirements.txt
  run_cmd cp runners.py /usr/local/lib/python3.6/dist-packages/fabric/runners.py
}

function install_ovftool(){
    run_cmd curl -s -o VMware-ovftool-4.3.0-12320924-lin.x86_64.bundle http://misc.labrepo.sil.lab/VMware-ovftool-4.3.0-12320924-lin.x86_64.bundle
    run_cmd bash VMware-ovftool-4.3.0-12320924-lin.x86_64.bundle
}

function install_sonarscanner(){
    pushd ~/ > /dev/null
    run_cmd wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.2.0.1873-linux.zip
    run_cmd unzip sonar-scanner-cli-4.2.0.1873-linux.zip
    run_cmd ln -s /home/gitlab/sonar-scanner-4.2.0.1873-linux/bin/sonar-scanner /usr/bin/sonar-scanner
    popd > /dev/null
}

update_system_pkgs
setup_gitlab_runner
install_requirements
install_ovftool
install_sonarscanner

popd > /dev/null