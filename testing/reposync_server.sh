#!/bin/bash

EPEL_RPM_PUBLIC_URL="https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm"
SERVER_REPOS=("rhel-7-server-rpms"
              "rhel-7-server-extras-rpms"
              "rhel-7-server-optional-rpms"
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
    run_cmd yum -y update
    run_cmd yum -y install httpd yum-utils createrepo
    run_cmd yum -y install mod_ssl
    echo "Dependencies installed..."
}

function install_epel() {
    run_cmd yum -y install $EPEL_RPM_PUBLIC_URL
    echo "Epel-release installed..."
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
        echo "Standard: Requires Org + Activation Key"
        echo "RedHat Developer Login: A RedHat Developer account is free signup here https://developers.redhat.com/"
        echo "RedHat Developer License cannot be used in production environments"
        select cr in "Standard" "RedHat Developer" ; do
                case $cr in
                    Standard )
                    export RHEL_SUB_METHOD="standard";
                    break
                    ;;
                    "RedHat Developer" )
                    export RHEL_SUB_METHOD="developer";
                    break
                    ;;
                esac
            done
        while true; do
            subscription-manager remove --all
            subscription-manager unregister
            subscription-manager clean

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
            elif [ "$RHEL_SUB_METHOD" == "developer" ]; then
                subscription-manager register
            fi

            subscription-manager refresh
            subscription-manager attach --auto
            echo "Checking subscription status..."
            subscription_status=`subscription-manager status | grep 'Overall Status:' | awk '{ print $3 }'`

            if [ "$subscription_status" == "Current" ]; then
                break;
            else
                echo "Error subscription appears to be invalid please try again..."
                exit 3
            fi
        done;

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
        reposync --gpgcheck -l --repoid=$repo --download_path=$repo_path --download-metadata --downloadcomps
        pushd $repo_path/$repo > /dev/null
        rm -rf .repodata
        rm -rf repodata
        createrepo -g comps.xml .
        popd > /dev/null
    done
    echo "RHEL sync complete"
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
    mv /etc/httpd/conf.d/userdir.conf /etc/httpd/conf.d/userdir.con.bak
    mv /etc/httpd/conf.d/welcome.conf /etc/httpd/conf.d/welcome.con.bak
}

root_check

if [ -z "$RHEL_ACTIVATIONKEY" ] && [ -z "$RHEL_ORGANIZATION" ]; then
    subscription_prompts
else
    register
    attach_repos
fi

install_deps
install_epel
rhel_reposync
create_repo_config