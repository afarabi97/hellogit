Name:       tfplenum
Version:    %{rpm_version}
Release:    %{release_inc}%{?dist}
Summary:    The tfplenum web package contains all the production delivery code as well as all the python virtual environment packages.
License:    Property of US government
Requires:   tfplenum-repo, python36, python36-devel, krb5-devel, krb5-workstation, gcc, policycoreutils-python-utils, nmap

%define tf_folder /opt/tfplenum
%define html_folder /var/www/html
%define core_folder %{tf_folder}/core
%define bootstrap_folder %{tf_folder}/bootstrap
%define testing_folder %{tf_folder}/testing
%define agent_pkgs_folder %{tf_folder}/agent_pkgs
%define stigs_folder %{tf_folder}/rhel8-stigs
%define scripts_folder %{tf_folder}/scripts
%define infrastructure_folder %{tf_folder}/infrastructure
%define web_folder %{tf_folder}/web
%define component_folder %{tf_folder}/component-builder
%define offlinerepo %{html_folder}/offlinerepo
%define local_pypi %{offlinerepo}/pip/simple
%define pip_env %{tf_folder}/.venv
%define tfplenum_etc /etc/tfplenum

%define frontend_folder %{html_folder}/frontend
%define mip_folder %{tf_folder}/mip

%define log_folder /var/log/tfplenum/
%define ansible_etc /etc/ansible

%define run_command \
run_cmd() {     \
    local command="$@"  \
    eval $command       \
    local ret_val=$?    \
    if [ $ret_val -ne 0 ]; then \
        echo "$command returned error code $ret_val" >> /var/log/tfplenum/rpm_error.log    \
        exit 1  \
    fi  \
}

%description
This is the main tfplenum RPM package for updating the code.

%pre
    if [ -s /var/log/tfplenum/rpm_error.log ]; then
        echo ""
        echo "================================"
        echo "=== PRECHECK ERROR FOUND!!! ===="
        echo "================================"
        echo ""
        echo "Error was found in tfplenum rpm logs."
        echo "Check the following logs: "
        echo "- var/log/tfplenum/rpm.log"
        echo "- var/log/tfplenum/rpm_error.log"
        echo "================================"
        echo ""
        exit 1
    fi
    exit 0

%install
mkdir -p %{buildroot}%{web_folder}/backend/
mkdir -p %{buildroot}%{web_folder}/frontend/
mkdir -p %{buildroot}%{component_folder}
mkdir -p %{buildroot}%{web_folder}/setup/
mkdir -p %{buildroot}%{core_folder}
mkdir -p %{buildroot}%{bootstrap_folder}
mkdir -p %{buildroot}%{testing_folder}
mkdir -p %{buildroot}%{agent_pkgs_folder}
mkdir -p %{buildroot}%{stigs_folder}
mkdir -p %{buildroot}%{scripts_folder}
mkdir -p %{buildroot}%{infrastructure_folder}
mkdir -p %{buildroot}%{mip_folder}
mkdir -p %{buildroot}%{frontend_folder}
mkdir -p %{buildroot}/usr/local/bin/
mkdir -p %{buildroot}%{log_folder}
mkdir -p %{buildroot}%{pip_env}/bin
mkdir -p %{buildroot}%{tfplenum_etc}
mkdir -p %{buildroot}%{ansible_etc}

#Copy files
cp -rf %{current_dir}/core/* %{buildroot}%{core_folder}
cp -rf %{current_dir}/web/backend/* %{buildroot}%{web_folder}/backend/
cp -rf %{current_dir}/web/frontend/* %{buildroot}%{web_folder}/frontend/
cp -rf %{current_dir}/component-builder/* %{buildroot}%{component_folder}
cp -rf %{current_dir}/web/setup/* %{buildroot}%{web_folder}/setup/
cp -rf %{current_dir}/bootstrap/* %{buildroot}%{bootstrap_folder}
cp -rf %{current_dir}/testing/* %{buildroot}%{testing_folder}
cp -rf %{current_dir}/agent_pkgs/* %{buildroot}%{agent_pkgs_folder}
cp -rf %{current_dir}/rhel8-stigs/* %{buildroot}%{stigs_folder}
cp -rf %{current_dir}/scripts/* %{buildroot}%{scripts_folder}
cp -rf %{current_dir}/infrastructure/* %{buildroot}%{infrastructure_folder}
cp -rf %{current_dir}/mip/* %{buildroot}%{mip_folder}
cp -rf %{current_dir}/web/frontend/dist/frontend/* %{buildroot}%{frontend_folder}
cp -rf %{current_dir}/requirements.txt %{buildroot}%{tf_folder}/requirements.txt
cp -rf %{current_dir}/aliases %{buildroot}%{tf_folder}/aliases
cp %{current_dir}/versions.yml %{buildroot}%{tf_folder}/versions.yml

touch %{buildroot}%{log_folder}/tfplenum.log
touch %{buildroot}%{pip_env}/bin/python3
touch %{buildroot}%{tfplenum_etc}/tfplenum.ini
cp -rf %{current_dir}/bootstrap/playbooks/ansible.cfg %{buildroot}%{ansible_etc}

%post
%run_command

if [$1 == 1 ];then
# Reset rpm log on install
rm -rf /var/log/tfplenum/rpm.log /var/log/tfplenum/rpm_error.log
fi

sed -i 's|log_path =.*|log_path = /var/log/tfplenum/rpm.log|g' %{ansible_etc}/ansible.cfg

mkdir -p /root/.kube /root/.pip
# Build pip environment
run_cmd /usr/bin/pip3 install --index-url=file://%{local_pypi}  cryptography
run_cmd /usr/bin/pip3 install --index-url=file://%{local_pypi}  virtualenv
run_cmd /usr/local/bin/virtualenv --python=python3 --system-site-packages %{tf_folder}/.venv
run_cmd /opt/tfplenum/.venv/bin/python3 -m pip install --index-url=file://%{local_pypi} -U pip
run_cmd /opt/tfplenum/.venv/bin/pip3 install --index-url=file://%{local_pypi} -r %{tf_folder}/requirements.txt

# Setup ansible
rm -f /usr/bin/ansible*
rm -f /usr/bin/dir2pi
ln -s %{pip_env}/bin/ansible-playbook /usr/bin/ansible-playbook
ln -s %{pip_env}/bin/ansible-console /usr/bin/ansible-console
ln -s %{pip_env}/bin/ansible-config /usr/bin/ansible-config
ln -s %{pip_env}/bin/ansible-galaxy /usr/bin/ansible-galaxy
ln -s %{pip_env}/bin/ansible-doc /usr/bin/ansible-doc
ln -s %{pip_env}/bin/ansible-inventory /usr/bin/ansible-inventory
ln -s %{pip_env}/bin/ansible-pull /usr/bin/ansible-pull
ln -s %{pip_env}/bin/ansible /usr/bin/ansible
ln -s %{pip_env}/bin/dir2pi /usr/bin/dir2pi
ln -s %{pip_env}/bin/gunicorn /usr/local/bin/gunicorn
ln -s %{pip_env}/bin/rqworker /usr/local/bin/rqworker
ln -s %{pip_env}/bin/rqscheduler /usr/local/bin/rqscheduler

run_cmd /usr/bin/ansible-galaxy collection install %{offlinerepo}/ansible-utils-*.tar.gz
run_cmd /usr/bin/ansible-galaxy collection install %{offlinerepo}/community-vmware-*.tar.gz

if [ $1 == 1 ];then
# Open up firewall ports
firewall-cmd --zone=public --add-service=http --permanent
firewall-cmd --zone=public --add-service=dns --permanent
firewall-cmd --zone=public --add-service=https --permanent
firewall-cmd --zone=public --add-service=ntp --permanent
firewall-cmd --zone=public --add-service=tftp --permanent
firewall-cmd --reload

useradd keycloak -s /sbin/nologin -d /opt/keycloak

fi

# Install Helm
run_cmd tar --strip-components=1 -xvf %{offlinerepo}/helm-*-linux-amd64.tar.gz -C /usr/local/bin/

BUILD_DATE=`date +"%FT%T%z"`
cat <<EOF > /etc/tfplenum/tfplenum.ini
[tfplenum]
version = %{rpm_version}-%{release_inc}
build_date = ${BUILD_DATE}
EOF
sed -i 's|log_path =.*|log_path = /var/log/ansible.log|g' %{ansible_etc}/ansible.cfg

%postun
if [ $1 == 0 ];then
    echo "--------------------"
    echo "tfplenum RPM is getting removed/uninstalled"
    echo "--------------------"

    # Stop and Disable Services
    systemctl stop tfplenum-backend
    systemctl disable tfplenum-backend
    systemctl stop rqworker@{1..20}.service
    systemctl disable rqworker@{1..20}.service
    systemctl stop rq-scheduler
    systemctl disable rq-scheduler
    systemctl stop keycloak
    systemctl disable keycloak
    systemctl stop httpd

    # Remove systemd files
    rm -rf /etc/systemd/system/tfplenum-backend.service
    rm -rf /etc/systemd/system/rqworker@.service
    rm -rf /etc/systemd/system/rq-scheduler.service
    rm -rf %{frontend_folder}
    rm -rf %{tf_folder}

    # Remove SSO
    rm -rf /opt/sso-idp
    userdel -r keycloak

    # Remove additional files and dirs
    rm -rf /root/.ansible /root/.pip /root/.keycloak
    rm -rf /etc/httpd/conf.d/tfplenum.conf /etc/httpd/conf.d/dod_root.pem
    rm -rf /etc/docker/certs.d/sil.lab
    rm -rf /usr/local/bin/gunicorn /usr/local/bin/rqworker /usr/local/bin/rqscheduler
    rm -rf /usr/bin/ansible-playbook /usr/bin/ansible-console /usr/bin/ansible-config
    rm -rf /usr/bin/ansible-galaxy /usr/bin/ansible-doc /usr/bin/ansible-inventory
    rm -rf /usr/bin/ansible-pull /usr/bin/ansible /usr/bin/dir2pi
    rm -rf /usr/local/bin/helm
    sed -i 's|source /opt/tfplenum/aliases||g' /root/.bashrc

    rm -rf /var/log/tfplenum/rpm.log /var/log/tfplenum/rpm_error.log

    # Disable firewall ports
    firewall-cmd --zone=public --remove-service=http --permanent
    firewall-cmd --zone=public --remove-service=dns --permanent
    firewall-cmd --zone=public --remove-service=https --permanent
    firewall-cmd --zone=public --remove-service=ntp --permanent
    firewall-cmd --zone=public --remove-service=tftp --permanent
    firewall-cmd --reload
fi

%files
%{web_folder}/backend/*
%{web_folder}/frontend/*
%{component_folder}/*
%{web_folder}/setup/*
%{core_folder}/*
%{bootstrap_folder}/*
%{testing_folder}/*
%{agent_pkgs_folder}/*
%{stigs_folder}/*
%{scripts_folder}/*
%{infrastructure_folder}/*
%{mip_folder}/*
%{frontend_folder}/*
%{tf_folder}/requirements.txt
%{log_folder}/*
%{tf_folder}/aliases
%{pip_env}/*
%{tfplenum_etc}/*
%{ansible_etc}
%{tf_folder}/versions.yml

%exclude
#pass

%changelog
# let's skip this for now
