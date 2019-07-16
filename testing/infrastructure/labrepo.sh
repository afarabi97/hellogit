#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
pushd $SCRIPT_DIR > /dev/null

source ./functions.sh

RHEL_VERSION="7.6"
RHEL_ISO="rhel-server-$RHEL_VERSION-x86_64-dvd.iso"


function install_deps(){
    run_cmd yum -y update
    run_cmd yum -y install httpd yum-utils createrepo
    run_cmd yum -y install mod_ssl
}

function check_rhel_iso(){
    echo "Checking for RHEL ISO..."
    rhel_iso_exists=false
    if [ -f /repos/isos/$RHEL_ISO ]; then
        rhel_iso_exists=true
        echo "RHEL ISO found! Moving on..."
    fi
}

function prompt_rhel_iso_download() {
    check_rhel_iso
    if [ "$rhel_iso_exists" == false ]; then
        echo "-------"

        echo "RHEL ISO is required to setup the kit."
        echo "Download the RHEL ISO following these instructions:"
        echo "***If you already have the $RHEL_ISO skip to step 6.***"
        echo ""
        echo "1. In a browser navgiate to https://access.redhat.com/downloads"
        echo "2. Select Red Hat Enterprise Linux."
        echo "3. Login using your Red Hat user/pass."
        echo "4. Select $RHEL_VERSION from the Versions dropdown."
        echo "5. Select Download for Red Hat Enterprise Linux $RHEL_VERSION Binary DVD."
        echo "6. SCP $RHEL_ISO to /repos/isos/ on your labrepo installation."

        while true; do
        read -p "Have you completed the above steps? (Y/N): " rhel_iso_prompted

        if [[ $rhel_iso_prompted =~ ^[Yy]$ ]]; then
            check_rhel_iso
            echo "rhel_iso_exists: $rhel_iso_exists"
            if [ "$rhel_iso_exists" == true ]; then
                break
            fi
        fi
        echo "Unable to find rhel iso please try again."
        done
    fi
}

function subscription_prompts(){
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
            fi
        done;

    fi

    if [ "$subscription_status" == "Current" ]; then
        subscription-manager repos --enable rhel-7-server-rpms
        subscription-manager repos --enable rhel-7-server-extras-rpms
        subscription-manager repos --enable rhel-7-server-optional-rpms
        prompt_rhel_iso_download
    fi
}

function gen_certs_for_labrepo(){
    # Specify where we will install
    # the xip.io certificate
    SSL_DIR="/etc/pki/tls"

    # Set the wildcarded domain
    # we want to use
    DOMAIN="*.labrepo.lan"

    # A blank passphrase
    PASSPHRASE=""

# Set our CSR variables
SUBJ="
C=US
ST=TEXAS
O=
localityName=SAN_ANTONIO
commonName=$DOMAIN
organizationalUnitName=
emailAddress=
"

    # Create our SSL directory
    # in case it doesn't exist
    mkdir -p "$SSL_DIR"

    # Generate our Private Key, CSR and Certificate
    run_cmd openssl genrsa -out "$SSL_DIR/private/localhost.key" 4096
    run_cmd openssl req -new -subj "$(echo -n "$SUBJ" | tr "\n" "/")" -key "$SSL_DIR/private/localhost.key" -out "$SSL_DIR/private/localhost.csr" -passin pass:$PASSPHRASE
    run_cmd openssl x509 -req -days 365 -in "$SSL_DIR/private/localhost.csr" -signkey "$SSL_DIR/private/localhost.key" -out "$SSL_DIR/certs/localhost.crt"
}

function copy_labrepo_configs(){
    unalias cp
    rm -f /etc/httpd/conf.d/welcome.conf
    run_cmd cp -vf labrepo/conf.d/* /etc/httpd/conf.d/
    run_cmd cp -v labrepo/root /var/spool/cron/
    run_cmd cp -v labrepo/sync_rhel_repos.sh /root/scripts/
    run_cmd cp -v labrepo/html/index.html /var/www/html/
    run_cmd cp -v labrepo/html/style.css /var/www/html/
    run_cmd cp -v labrepo/yum/index.html /repos/yum
    run_cmd cp -v labrepo/yum/style.css /repos/yum
}

function create_dirs(){
    mkdir -p /root/scripts
    mkdir -p /repos/archive
    mkdir -p /repos/isos
    mkdir -p /repos/yum
    mkdir -p /repos/releases
    mkdir -p /repos/misc
    mkdir -p /repos/pip
    mkdir -p /repos/yum/rhel/rhel-7-server-rpms
    mkdir -p /repos/yum/rhel/rhel-7-server-extras-rpms
    mkdir -p /repos/yum/rhel/rhel-7-server-optional-rpms
}

function open_firewall_ports(){
    firewall-cmd --permanent --add-port=80/tcp
    firewall-cmd --permanent --add-port=443/tcp
    firewall-cmd --reload
}

function reboot_system(){
    echo "Scripts ran successfully! Rebooting system in 5 seconds."
    sleep 5
    reboot
}

function inital_repo_sync(){
    run_cmd /root/scripts/sync_rhel_repos.sh
}

root_check
check_if_rhel_or_fail
subscription_prompts
install_deps
create_dirs
gen_certs_for_labrepo
copy_labrepo_configs
open_firewall_ports
inital_repo_sync
reboot_system

popd > /dev/null
