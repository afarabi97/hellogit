#!/bin/bash

if [ "$EUID" -ne 0 ]
  then echo "Please run as root or use sudo."
  exit
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
pushd $SCRIPT_DIR > /dev/null

source ./functions.sh

function install_worker_deps {
    run_cmd yum -y update
    run_cmd yum -y install git epel-release
	run_cmd yum -y install python36.x86_64 python36-pip unzip gcc python36-devel java-1.8.0-openjdk
}

function add_jenkins_user {
    userdel --remove jenkins
    run_cmd useradd -d /var/lib/jenkins jenkins
}

install_worker_deps
add_jenkins_user
setup_chrome
setup_sdk
install_requirements
install_ovftool
echo "Script complete!"

popd > /dev/null
