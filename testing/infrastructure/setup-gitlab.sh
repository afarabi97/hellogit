#!/bin/bash

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

function create_cert {
    openssl genrsa -out "gitlab.sil.lab.key" 2048
    openssl req -new -key gitlab.sil.lab.key -out gitlab.csr
    openssl x509 -req -days 3650 -in gitlab.csr -signkey gitlab.sil.lab.key -out gitlab.sil.lab.crt
    # Update the files in the /etc/gitlab/ssl
}

function update_system_pkgs {
    run_cmd yum update -y
}

function install_vmware_tools {
    run_cmd yum install -y perl open-vm-tools
}

function install_postfix_email {
    run_cmd yum install -y postfix
    run_cmd systemctl enable postfix
    run_cmd systemctl start postfix
}

function install_git_labs {
    run_cmd yum install -y curl policycoreutils-python openssh-server
    run_cmd systemctl enable sshd
    run_cmd systemctl start sshd
    run_cmd firewall-cmd --permanent --add-service=http
    run_cmd firewall-cmd --permanent --add-service=https
    run_cmd systemctl reload firewalld

    run_cmd curl https://packages.gitlab.com/install/repositories/gitlab/gitlab-ee/script.rpm.sh | bash
    sudo EXTERNAL_URL="https://gitlab.sil.lab" yum install -y gitlab-ee
}

function setup_ntp_sync {
    run_cmd yum install -y ntp ntpdate
    run_cmd systemctl start ntpd
    run_cmd systemctl enable ntpd
    run_cmd ntpdate -u -s 0.centos.pool.ntp.org 1.centos.pool.ntp.org 2.centos.pool.ntp.org
    run_cmd systemctl restart ntpd
    timedatectl
    run_cmd hwclock -w
}

update_system_pkgs
install_vmware_tools
install_postfix_email
install_git_labs
setup_ntp_sync
