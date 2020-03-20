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
    run_cmd yum install -y perl open-vm-tools nmap
}

function install_gitlab_runner {
    # yum install -y wget git
    # wget https://gitlab-runner-downloads.s3.amazonaws.com/latest/rpm/gitlab-runner_amd64.rpm
    # rpm -i gitlab-runner_amd64.rpm

    mkdir -p /etc/gitlab-runner/certs/
    run_cmd openssl s_client -showcerts -connect gitlab.sil.lab:443 </dev/null | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > /etc/gitlab-runner/certs/gitlab.sil.lab.crt
    run_cmd gitlab-ci-multi-runner register
}

function install_requirements(){
  pushd $int_testing_dir > /dev/null
  run_cmd pip3 install --upgrade pip
  run_cmd pip3 install -r ../pipeline/requirements.txt
  popd > /dev/null
}


function install_ovftool(){
    pushd /root > /dev/null
    run_cmd curl -s -o VMware-ovftool-4.3.0-12320924-lin.x86_64.bundle http://misc.labrepo.sil.lab/VMware-ovftool-4.3.0-12320924-lin.x86_64.bundle
    run_cmd bash VMware-ovftool-4.3.0-12320924-lin.x86_64.bundle
    popd > /dev/null
}

# update_system_pkgs
# install_vmware_tools
install_gitlab_runner
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
