#!/bin/bash

# This script has been modified to configure JUST the environment, and not to 
# setup the gitlab-ci or runner components at all.
# ------------------------------------------------------------------------------
# POC THISTA: Red Thomas <red.thomas@red-knight.com>, 210.880.5777
# ------------------------------------------------------------------------------

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

function remove_conflicts {
	  # These packages caused the pip installs to fail, they'll be added back
    run_cmd apt-get remove -y libyaml-0-2 python3-yaml python3-pyasn1-modules
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

function install_nodejs(){
    run_cmd rm -rf node-v13.5.0-linux-x64*
	run_cmd wget https://nodejs.org/dist/v13.5.0/node-v13.5.0-linux-x64.tar.xz
    run_cmd tar xf node-v13.5.0-linux-x64.tar.xz
    run_cmd cd node-v13.5.0-linux-x64/
    run_cmd cp -R * /usr/local/
    run_cmd cd ..
	run_cmd rm -rf node-v13.5.0-linux-x64/
	run_cmd rm -f node-v13.5.0-linux-x64.tar.xz
    run_cmd node -v
    run_cmd npm -v
}

update_system_pkgs
remove_conflicts
install_nodejs
install_requirements
install_ovftool

popd > /dev/null
