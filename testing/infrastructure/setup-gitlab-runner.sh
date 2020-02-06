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
    run_cmd yum update -y
}

function install_vmware_tools {
    run_cmd yum install -y perl open-vm-tools
}

function install_gitlab_runner {
    # For RHEL/CentOS/Fedora
    run_cmd curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.rpm.sh | sudo bash

    # For RHEL/CentOS/Fedora
    run_cmd yum install gitlab-runner

    gitlab-ci-multi-runner register
    mkdir /etc/gitlab-runner/certs/

    #Download the certifcate manually from your webbrowser from
    #https://gitlab.sil.lab/api/v4/runners
    #put this file in /etc/gitlab-runner/certs/ and name it gitlab.sil.lab.crt

    mkdir -p /etc/gitlab-runner/certs/
    run_cmd openssl s_client -showcerts -connect gitlab.sil.lab:443 </dev/null | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > /etc/gitlab-runner/certs/gitlab.sil.lab.crt
    run_cmd gitlab-ci-multi-runner register
}

function install_worker_deps {
    run_cmd yum -y install git epel-release
	run_cmd yum -y install python36.x86_64 python36-pip unzip gcc python36-devel
}


function install_requirements(){
  pushd $int_testing_dir > /dev/null
  run_cmd pip3 install --upgrade pip
  run_cmd pip3 install --upgrade --force-reinstall -r /opt/vsphere-automation-sdk-python/requirements.txt --extra-index-url file:///opt/vsphere-automation-sdk-python/lib
  run_cmd pip3 install -r requirements.txt
  popd > /dev/null
}

function setup_sdk(){
  pushd /opt > /dev/null
  rm -rf vsphere-automation-sdk-python
  git clone https://github.com/vmware/vsphere-automation-sdk-python.git
  cd vsphere-automation-sdk-python/
  git checkout v6.8.7
  cd ..
  popd > /dev/null
}

function install_ovftool(){
    pushd /root > /dev/null
    run_cmd curl -s -o VMware-ovftool-4.3.0-12320924-lin.x86_64.bundle http://misc.labrepo.sil.lab/VMware-ovftool-4.3.0-12320924-lin.x86_64.bundle
    run_cmd bash VMware-ovftool-4.3.0-12320924-lin.x86_64.bundle
    popd > /dev/null
}

update_system_pkgs
install_vmware_tools
install_gitlab_runner
install_worker_deps
setup_sdk
install_requirements
install_ovftool
echo "Script complete!"



# concurrent = 1
# check_interval = 0

# [session_server]
#   session_timeout = 1800

# [[runners]]
#   name = "tfplenum builder"
#   url = "https://gitlab.sil.lab"
#   token = "HRZ2xwoRPkzJeZm15usz"
#   executor = "shell"
#   environment = [
#     "GIT_SSL_NO_VERIFY=1"
#   ]

#   [runners.custom_build_dir]
#   [runners.cache]
#     [runners.cache.s3]
#     [runners.cache.gcs]

popd > /dev/null
