#!/bin/bash

REGISTRATION_TOKEN="UZgSmuK8sRVDHfRhuyzZ"
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

function install_docker_compose {
    run_cmd curl -L "https://github.com/docker/compose/releases/download/1.25.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    run_cmd chmod +x /usr/local/bin/docker-compose
}

function install_docker_engine {
    run_cmd yum remove -y docker \
                docker-client \
                docker-client-latest \
                docker-common \
                docker-latest \
                docker-latest-logrotate \
                docker-logrotate \
                docker-engine
    run_cmd yum install -y yum-utils device-mapper-persistent-data lvm2
    run_cmd yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
    run_cmd yum install -y docker-ce docker-ce-cli containerd.io
    systemctl start docker
    systemctl enable docker
}

function install_gitlab_runner {
    # For RHEL/CentOS/Fedora
    run_cmd curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.rpm.sh | sudo bash

    # # For RHEL/CentOS/Fedora
    run_cmd yum install -y gitlab-runner

    mkdir -p /etc/gitlab-runner/certs/
    run_cmd openssl s_client -showcerts -connect gitlab.sil.lab:443 </dev/null | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > /etc/gitlab-runner/certs/gitlab.sil.lab.crt

    run_cmd gitlab-ci-multi-runner register
    # --url https://gitlab.sil.lab/ \
    # --registration-token $REGISTRATION_TOKEN \
    # --executor docker \
    # --description "Tfplenum Docker Runner" \
    # --docker-image "docker:19.03.1" \
    # --tag-list "tfplenum-docker" \
    # --docker-privileged \
    # --docker-volumes "/certs/client"
}

update_system_pkgs
install_vmware_tools
install_docker_engine
install_gitlab_runner

#After a reboot you can comment out everything that was just run and setup docker compose.
# install_docker_compose

#Make sure cat /etc/gitlab-runner/config.toml looks like the below
#run gitlab-ci-multi-runner restart
: '
concurrent = 4
check_interval = 0

[session_server]
  session_timeout = 1800

[[runners]]
  name = "tfplenum docker runner"
  url = "https://gitlab.sil.lab/"
  token = "w7ddpWi56X-Fti72umkf"
  executor = "docker"
  environment = [
    "GIT_SSL_NO_VERIFY=1"
  ]
  [runners.custom_build_dir]
  [runners.docker]
    tls_verify = false
    image = "docker:19.03.1"
    privileged = true
    disable_entrypoint_overwrite = false
    oom_kill_disable = false
    disable_cache = false
    volumes = ["/certs/client", "/cache"]
    shm_size = 0
  [runners.cache]
    [runners.cache.s3]
    [runners.cache.gcs]
'

popd > /dev/null
