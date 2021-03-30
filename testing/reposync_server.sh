#!/bin/bash

EPEL_RPM_PUBLIC_URL="https://download.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm"
SERVER_REPOS=("codeready-builder-for-rhel-8-x86_64-rpms"
              "rhel-8-for-x86_64-appstream-rpms"
              "rhel-8-for-x86_64-baseos-rpms"
              "rhel-8-for-x86_64-supplementary-rpms"
             )

function run_cmd {
	local command="$@"
	eval $command
	local ret_val=$?
	if [ $ret_val -ne 0 ]; then
		echo "$command returned error code $ret_val"
        exit 1
	fi
}

function root_check() {
    if [ "$EUID" -ne 0 ]
        then echo "Please run as root or use sudo."
        exit 2
    fi
}

function install_deps() {
    run_cmd dnf -y update
    run_cmd dnf -y install httpd dnf-utils createrepo
    run_cmd dnf -y install mod_ssl
    echo "Dependencies installed..."
    echo " "
}

function install_epel() {
    run_cmd dnf -y install $EPEL_RPM_PUBLIC_URL
    echo "Epel-release installed..."
    echo " "
}

function clean_subs() {
            subscription-manager remove --all
            subscription-manager unregister
            subscription-manager clean
}

function subscription_prompts() {
    echo "Verifying RedHat Subscription..."
    subscription_status=`subscription-manager status | grep 'Overall Status:' | awk '{ print $3 }'`
    if [ "$subscription_status" != "Current" ]; then
        echo "-------"
        echo "Since you are running a RHEL controller outside the Dev Network and/or not using Labrepo, "
        echo "You will need to subscribe to RHEL repositories."
        echo "-------"
        echo "Select RedHat subscription method:"
        echo " "
        echo "Standard: Requires Org + Activation Key"
        echo "RedHat Login: Requires User + Password"

        select cr in "Standard" "RedHat Login" ; do
                case $cr in
                    Standard )
                    export RHEL_SUB_METHOD="standard";
                    break
                    ;;
                    "RedHat Login" )
                    export RHEL_SUB_METHOD="login";
                    break
                    ;;
                esac
            done
            clean_subs
            if [ "$RHEL_SUB_METHOD" == "standard" ]; then
                if [ -z "$RHEL_ORGANIZATION" ]; then
                    read -p 'Please enter your RHEL org number (EX: Its the --org flag for the subscription-manager command): ' orgnumber
                    export RHEL_ORGANIZATION=$orgnumber
                fi

                if [ -z "$RHEL_ACTIVATIONKEY" ]; then
                    read -p 'Please enter your RHEL activation key (EX: Its the --activationkey flag for the subscription-manager command): ' activationkey
                    export RHEL_ACTIVATIONKEY=$activationkey
                fi
                subscription-manager register --activationkey=$RHEL_ACTIVATIONKEY --org=$RHEL_ORGANIZATION --force
            elif [ "$RHEL_SUB_METHOD" == "login" ]; then
                subscription-manager register
            fi
            subscription-manager refresh
            subscription-manager attach --auto
    fi
}

function register() {
    subscription-manager register --activationkey=$RHEL_ACTIVATIONKEY --org=$RHEL_ORGANIZATION --force
    subscription-manager refresh
    subscription-manager attach --auto
}

function attach_repos() {
    if [ "$subscription_status" == "Current" ]; then
        for repo in ${SERVER_REPOS[@]}; do
            subscription-manager repos --enable $repo
        done
    fi
}

function rhel_reposync() {
    repo_path="/var/www/html/repo"
    mkdir -p $repo_path
    pushd "$repo_path" > /dev/null
    for repo in ${SERVER_REPOS[@]}; do
        echo "Syncing $repo..."
        dnf reposync -m --repoid=$repo --destdir=$repo_path --download-metadata
        pushd $repo_path/$repo > /dev/null
        rm -rf .repodata
        rm -rf repodata
        popd > /dev/null
    done
    createrepo $repo_path
    echo "RHEL sync complete"
    echo " "
}

function create_repo_config() {
cat <<EOF > /etc/httpd/conf.d/repo.conf
<VirtualHost *:80>
    DocumentRoot /var/www/html/repo
  <Directory /var/www/html/repo>
        Options +Indexes +FollowSymLinks +MultiViews
        AllowOverride All
        Require all granted
  </Directory>
</VirtualHost>
EOF
    if [ -f /etc/httpd/conf.d/userdir.conf ]; then
    mv /etc/httpd/conf.d/userdir.conf /etc/httpd/conf.d/userdir.con.bak
    fi
    if [ -f /etc/httpd/conf.d/welcome.conf ]; then
    mv /etc/httpd/conf.d/welcome.conf /etc/httpd/conf.d/welcome.con.bak
    fi
    echo "Restarting httpd"
    run_cmd systemctl restart httpd
    run_cmd systemctl enable httpd
    run_cmd systemctl start httpd
    echo "Enabling httpd on firewall"
    run_cmd firewall-cmd --permanent --add-service=http
    echo "Reloading firewall"
    run_cmd firewall-cmd --reload
    echo " "

}

function cleaning() {
    echo "Cleaning dnf"
    dnf clean all
    echo " "
}

root_check

if [ -z "$RHEL_ACTIVATIONKEY" ] && [ -z "$RHEL_ORGANIZATION" ]; then
    subscription_prompts
    attach_repos
else
    register
    attach_repos
fi

install_deps
install_epel
rhel_reposync
create_repo_config
cleaning
