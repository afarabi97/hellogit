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

function install_postgresql {
    run_cmd rpm -Uvh https://yum.postgresql.org/10/redhat/rhel-7-x86_64/pgdg-centos10-10-2.noarch.rpm
    run_cmd yum install -y postgresql10-server postgresql10
    run_cmd /usr/pgsql-10/bin/postgresql-10-setup initdb
    #change peer to trust and ident to md5 for  the all alls in /var/lib/pgsql/10/data/pg_hba.conf
    #https://devopscube.com/setup-and-configure-sonarqube-on-linux/
    systemctl start postgresql-10
    systemctl enable postgresql-10

    :"
    Run these steps manually
    passwd postgres
    su - postgres
    psql
    create database sonarqubedb;
    create user sonarqube with encrypted password 'your-strong-password';
    grant all privileges on database sonarqubedb to sonarqube
    \q
    exit
    "
}

function configure_sonarqube {
    run_cmd sysctl -w vm.max_map_count=262144
    run_cmd sysctl -w fs.file-max=65536
    run_cmd ulimit -n 65536
    run_cmd ulimit -u 4096

    cp /etc/security/limits.conf /etc/security/limits.conf.bak
    adduser --system --no-create-home sonarqube
    chown -R sonarqube:sonarqube /opt/sonarqube-8.1.0.31237/

cat << EOF > /etc/sysctl.d/99-sonarqube.conf
vm.max_map_count=262144
fs.file-max=65536
EOF

cat << EOF > /etc/security/limits.conf
sonarqube   -   nofile   65536
sonarqube   -   nproc    4096
EOF

cat <<EOF > /etc/systemd/system/sonarqube.service
[Unit]
Description=SonarQube service
After=syslog.target network.target

[Service]
Type=simple
User=sonarqube
Group=sonarqube
PermissionsStartOnly=true
ExecStart=/bin/nohup /usr/bin/java -Xms32m -Xmx32m -Djava.net.preferIPv4Stack=true -jar /opt/sonarqube-8.1.0.31237/lib/sonar-application-8.1.0.31237.jar
StandardOutput=syslog
LimitNOFILE=65536
LimitNPROC=4096
TimeoutStartSec=5
Restart=always
SuccessExitStatus=143

[Install]
WantedBy=multi-user.target
EOF

    :'
        make sure /opt/sonarqube-8.1.0.31237/conf/sonar.properties has:
        sonar.jdbc.username=sonarqube
        sonar.jdbc.password=<sonar-db-password>
        sonar.jdbc.url=jdbc:postgresql://localhost/sonarqubedb
    '
    run_cmd systemctl daemon-reload
    run_cmd systemctl enable sonarqube.service
    run_cmd systemctl restart sonarqube.service
}

function install_sonarqube_community {
    pushd /opt > /dev/null
    run_cmd yum install -y wget unzip java-11-openjdk net-tools
    run_cmd wget https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-8.1.0.31237.zip
    run_cmd unzip sonarqube-8.1.0.31237.zip
    popd > /dev/null
}

function install_sonarqube_commercial {
    pushd /opt > /dev/null
    run_cmd yum install -y wget unzip java-11-openjdk net-tools
    run_cmd wget https://binaries.sonarsource.com/CommercialDistribution/sonarqube-developer/sonarqube-developer-8.1.0.31237.zip
    run_cmd unzip sonarqube-8.1.0.31237.zip
    popd > /dev/null
}

function open_firewall_port {
    firewall-cmd --permanent --add-port=9000/tcp
    firewall-cmd --reload
}

update_system_pkgs
install_vmware_tools
install_postgresql

# install_sonarqube_community
# install_sonarqube_commercial
# configure_sonarqube
# open_firewall_port


popd > /dev/null
