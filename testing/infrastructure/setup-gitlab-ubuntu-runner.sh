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

function disable_host_key_checking {
    run_cmd cat <<EOF > ~/.ssh/config
Host *
    StrictHostKeyChecking no
EOF

    run_cmd chmod 400 ~/.ssh/config
}

function install_packages {
    run_cmd apt-get install ansible-lint -y
    run_cmd apt-get install zip -y
}

function update_system_pkgs {
    run_cmd apt-get update -y
    run_cmd apt-get install open-vm-tools perl curl python3.6 python3-pip sshpass -y
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
  run_cmd pip3 install -r requirements.txt
  run_cmd cp runners.py /usr/local/lib/python3.6/dist-packages/fabric/runners.py
}

function install_ovftool(){
    run_cmd curl -s -o VMware-ovftool-4.3.0-12320924-lin.x86_64.bundle http://misc.labrepo.sil.lab/VMware-ovftool-4.3.0-12320924-lin.x86_64.bundle
    run_cmd bash VMware-ovftool-4.3.0-12320924-lin.x86_64.bundle
}

function install_sonarscanner(){
    pushd ~/ > /dev/null
    apt install unzip
    run_cmd wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.2.0.1873-linux.zip
    run_cmd unzip sonar-scanner-cli-4.2.0.1873-linux.zip
    run_cmd ln -s /home/gitlab/sonar-scanner-4.2.0.1873-linux/bin/sonar-scanner /usr/bin/sonar-scanner
    popd > /dev/null
}

function install_nodejs(){
    run_cmd rm -rf node-v14.5.0-linux-x64*
	run_cmd wget https://nodejs.org/dist/v14.5.0/node-v14.5.0-linux-x64.tar.xz
    run_cmd tar xf node-v14.5.0-linux-x64.tar.xz
    run_cmd cd node-v14.5.0-linux-x64/
    run_cmd cp -R * /usr/local/
    run_cmd cd ..
	run_cmd rm -rf node-v14.5.0-linux-x64/
	run_cmd rm -f node-v14.5.0-linux-x64.tar.xz
    run_cmd node -v
    run_cmd npm -v
}

function install_powershell(){
    # Download the Microsoft repository GPG keys
    run_cmd wget -q https://packages.microsoft.com/config/ubuntu/18.04/packages-microsoft-prod.deb
    # Register the Microsoft repository GPG keys
    run_cmd dpkg -i packages-microsoft-prod.deb
    # Update the list of products
    run_cmd apt-get update
    # Enable the "universe" repositories
    run_cmd add-apt-repository universe
    # Install PowerShell
    run_cmd apt-get install -y powershell
}

function update_profile(){
    run_cmd cat <<EOF > /root/.profile
# ~/.profile: executed by Bourne-compatible login shells.

if [ "$BASH" ]; then
  if [ -f ~/.bashrc ]; then
    . ~/.bashrc
  fi
fi

tty -s && mesg n
EOF

}

function install_docker(){
    apt-get remove docker docker-engine docker.io containerd runc
    apt-get update

    apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

    add-apt-repository \
    "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) \
    stable"

    apt-get update
    apt-get install docker-ce docker-ce-cli containerd.io
    systemctl enable docker
    run_cmd cat <<EOF > /etc/docker/daemon.json
{
    "insecure-registries" : ["nexus.sil.lab:443"]
}
EOF
    systemctl restart docker
}

disable_host_key_checking
update_system_pkgs
install_nodejs
setup_gitlab_runner
install_packages
install_requirements
install_ovftool
install_sonarscanner
install_powershell
install_docker
update_profile

popd > /dev/null
