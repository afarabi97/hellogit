#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
FRONTEND_DIR="$SCRIPT_DIR/../"

if [ "$EUID" -ne 0 ]
  then echo "Please run as root or use sudo."
  exit
fi

pushd $SCRIPT_DIR > /dev/null
source ./common.in

function _install_deps(){
	yum -y install https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
	yum -y install wget nmap unzip
}

function _install_nodejs(){
    run_cmd rm -rf node-v8.11.4-linux-x64*
	run_cmd wget https://nodejs.org/dist/v8.11.4/node-v8.11.4-linux-x64.tar.xz
    run_cmd tar xf node-v8.11.4-linux-x64.tar.xz
    run_cmd cd node-v8.11.4-linux-x64/
    run_cmd cp -R * /usr/local/
    run_cmd cd ..
	run_cmd rm -rf node-v8.11.4-linux-x64/
	run_cmd rm -f node-v8.11.4-linux-x64.tar.xz
    run_cmd node -v
    run_cmd npm -v
}

function _install_angular(){
	pushd $FRONTEND_DIR/frontend > /dev/null
	run_cmd npm install -g npm@latest
	run_cmd npm install -g @angular/cli@7.3.9
	run_cmd npm cache verify
	run_cmd npm i
    run_cmd npm install
	npm audit fix
	popd > /dev/null
}

function _open_firewall_ports(){
    firewall-cmd --permanent --add-port=4200/tcp
    firewall-cmd --permanent --add-port=443/tcp
    firewall-cmd --reload
}

function _install_python36(){
	run_cmd yum install -y gcc
	run_cmd yum install -y python36 python36-devel
	mkdir -p /root/.pip/
}

function _setup_pythonenv {
	pushd $FRONTEND_DIR/ > /dev/null
	systemctl is-active tfplenum-frontend && systemctl stop tfplenum-frontend # If it's running, it needs to be stopped
	run_cmd rm -rf $FRONTEND_DIR/tfp-env
	run_cmd python3.6 -m venv tfp-env
	run_cmd $FRONTEND_DIR/tfp-env/bin/pip install --upgrade pip
	run_cmd $FRONTEND_DIR/tfp-env/bin/pip install -r requirements.txt
	popd > /dev/null
}

function _configure_httpd {
	local private_key="/etc/ssl/private/apache-selfsigned.key"
	local certificate="/etc/ssl/certs/apache-selfsigned.crt"
	run_cmd yum -y install httpd
	run_cmd yum -y install mod_ssl

	# On RHEL these lines are needed because they do not not automatically allow connectivity.
	/usr/sbin/setsebool httpd_can_network_connect 1
	/usr/sbin/setsebool -P httpd_can_network_connect 1

	mkdir /etc/ssl/private
	run_cmd chmod 700 /etc/ssl/private
	run_cmd openssl req -x509 -nodes -subj "/C=US/ST=Texas/L=Dallas/O=uknown/CN=tfplenum" -days 36500 -newkey rsa:4096 -keyout $private_key -out $certificate
	run_cmd chmod 600 $private_key
	run_cmd chmod 644 $certificate
	run_cmd openssl dhparam -dsaparam -out /etc/ssl/certs/dhparam.pem 4096
	run_cmd cat /etc/ssl/certs/dhparam.pem | sudo tee -a /etc/ssl/certs/apache-selfsigned.crt
	mv -v /etc/httpd/conf.d/ssl.conf /etc/httpd/conf.d/ssl.conf.bak
	run_cmd cp -v ./tfplenum.conf /etc/httpd/conf.d/
    run_cmd rm -rf /etc/httpd/conf.d/welcome.conf
}

function _install_and_configure_gunicorn {
	cp ./tfplenum-frontend.service /etc/systemd/system/
	run_cmd systemctl daemon-reload
	run_cmd systemctl enable tfplenum-frontend.service
}

function _install_and_start_mongo40 {
cat <<EOF > /etc/yum.repos.d/mongodb-org-4.0.repo
[mongodb-org-4.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/4.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-4.0.asc
EOF
	run_cmd yum install -y mongodb-org
	run_cmd systemctl enable mongod
}

function _install_redis {
    cat <<EOF > /etc/yum.repos.d/remi.repo
[remi]
name=Remis RPM repository for Enterprise Linux 7 - $basearch
mirrorlist=http://cdn.remirepo.net/enterprise/7/remi/mirror
enabled=0
gpgcheck=1
gpgkey=https://rpms.remirepo.net/RPM-GPG-KEY-remi
EOF
    run_cmd yum install -y redis --enablerepo=remi
    run_cmd systemctl enable redis
}

function _install_and_configure_celery {
    mkdir -p /var/log/celery /etc/celery/
    cp ./celery.conf /etc/celery/
	cp ./celery.service /etc/systemd/system/
	run_cmd systemctl daemon-reload
	run_cmd systemctl enable celery.service
}

function _preload_ids_rules {
	mkdir -p $FRONTEND_DIR/backend/rules
	pushd $FRONTEND_DIR/backend/rules > /dev/null
	curl -L -O https://rules.emergingthreats.net/open/suricata-4.0/emerging.rules.tar.gz
	tar xzf emerging.rules.tar.gz
	popd > /dev/null

	pushd $FRONTEND_DIR/backend > /dev/null
	$FRONTEND_DIR/tfp-env/bin/python preload_suricata_rules.py
	popd > /dev/null
}

rm -rf ~/.pip
mkdir -p /var/log/tfplenum/
_install_deps
_install_nodejs
_install_angular
_install_python36
_setup_pythonenv
_configure_httpd
_deploy_angular_application
_install_and_configure_gunicorn
_install_and_start_mongo40
_install_redis
_install_and_configure_celery
_restart_services
_open_firewall_ports
_preload_ids_rules

popd > /dev/null