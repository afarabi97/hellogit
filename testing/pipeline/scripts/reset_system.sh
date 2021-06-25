#!/bin/bash

if [ "$EUID" -ne 0 ]; then
    echo "Please run as root or use sudo."
    exit 1
fi

ARGUMENTS="$@"

function run_cmd {
    local command="$@"
    eval $command
    local ret_val=$?
    if [ $ret_val -ne 0 ]; then
        echo "$command returned error code $ret_val"
        exit 1
    fi
}

function help_info {
    echo "
usage: reset_system.sh - Script is used to reset systems before an OVA export is performed.
                         This logic was converted so that we can reset things outside of pipeline and export them manually if needed.

arguments:
  -h, --help            show this help message and exit
  --reset-controller    Resets a controller back to something that can be export.  Clears its database, history, resets its network configuration scripts, etc.
  --reset-node          Runs general reset on a node. Clears its database, history, resets its network configuration scripts, etc.
  --reset-temp-ctrl     Runs everything execept password reset and network reset
  --hostname=<hostname> The hostname you wish to set the node to.
"
}

function parse_command_line_args {
    for e in "$ARGUMENTS"; do
        for i in $e; do
        case $i in
            -h|--help)
            SHOW_HELP=yes
            shift # past argument with no value
            ;;
            --reset-controller)
            RESET_CONTROLLER=yes
            shift # past argument with no value
            ;;
            --reset-node)
            RESET_NODE=yes
            shift # past argument with no value
            ;;
            --hostname=*)
            HOST_NAME="${i#*=}"
            shift # past argument=value
            ;;
            --reset-temp-ctrl=*)
            RESET_TEMP_CONTROLLER="${i#*=}"
            shift # past argument=value
            ;;
            *)
                # Unknown commmand line flag
            ;;
        esac
        done
    done


    if [[ $SHOW_HELP == "yes" ]]; then
        help_info
        exit 0
    fi

    if [[ $RESET_TEMP_CONTROLLER == "yes" ]];then
        RESET_NODE=no
        RESET_CONTROLLER=no
    else
        RESET_TEMP_CONTROLLER=no
    fi

    if [[ -z $RESET_CONTROLLER && -z $RESET_NODE ]]; then
        echo "At least one --reset-controller or --reset-node flag is required."
        exit 2
    fi

    echo "RESET_CTRL  = $RESET_CONTROLLER"
    echo "RESET_NODE  = $RESET_NODE"
    echo "RESET_TEMP_CONTROLLER = $RESET_TEMP_CONTROLLER"
}

function reset_password {
    rm -f /etc/passwd.lock
    rm -f /etc/shadow.lock
    run_cmd usermod --password Q9sIxtbggUGaw root
}

function update_network_scripts {
    ENS192=/etc/sysconfig/network-scripts/ifcfg-ens192
    BR0=/etc/sysconfig/network-scripts/ifcfg-br0

    if [ -f "$ENS192" ]; then
        sed -i 's/^\(BOOTPROTO=\).*/\1dhcp/g' /etc/sysconfig/network-scripts/ifcfg-ens192
        sed -i '/^IPADDR/ d' /etc/sysconfig/network-scripts/ifcfg-ens192
        sed -i '/^GATEWAY/ d' /etc/sysconfig/network-scripts/ifcfg-ens192
        sed -i '/^DNS1/ d' /etc/sysconfig/network-scripts/ifcfg-ens192
    fi

    if [ -f "$BR0" ]; then
        sed -i 's/^\(BOOTPROTO=\).*/\1dhcp/g' /etc/sysconfig/network-scripts/ifcfg-br0
        sed -i '/^IPADDR/ d' /etc/sysconfig/network-scripts/ifcfg-br0
        sed -i '/^GATEWAY/ d' /etc/sysconfig/network-scripts/ifcfg-br0
        sed -i '/^DNS1/ d' /etc/sysconfig/network-scripts/ifcfg-br0
    fi

    nmcli conn delete id 'Wired connection 1' 2>/dev/null
    nmcli conn reload
}

function clear_etc_hosts {
    cat <<EOF > /etc/hosts
# Ansible managed
127.0.0.1 localhost localhost.localdomain localhost4 localhost4.localdomain4
EOF
}

function reset_openvpn_server {
    dnf remove openvpn -y
    systemctl stop openvpn-server@server.service
    systemctl disable openvpn-server@server.service
    rm -rf /etc/openvpn
}

function reset_dhcp {
    systemctl stop dhcpd
    systemctl disable dhcpd
    rm -rf /etc/dhcp/dhcpd.conf
}

function reset_kickstart {
    rm -rf /var/lib/tftpboot/{pxelinux.cfg,uefi}
    rm -rf /var/www/html/ks/*
}

function wait_for_mongo {
    while true
    do
        echo "Sleeping 10 seconds to wait for mongo to bootup."
        sleep 10
        systemctl status mongod > /dev/null
        local status=$(echo $?)
        if [[ $status == 0 ]]; then
            break
        fi
    done

}

function clear_tfplenum_database {
    if [[ $RESET_CONTROLLER == "yes" || $RESET_TEMP_CONTROLLER == "yes" ]]; then

        wait_for_mongo

        collections=(
            'catalog_saved_values'
            'console'
            'counters'
            'elastic_deploy'
            'jobs'
            'metrics'
            'nodes'
            'notifications'
            'settings'
        )

        for collection in "${collections[@]}"
        do
            echo "Clearing $collection"
            local cmd="db.${collection}.drop();"
            mongo --eval $cmd tfplenum_database
        done
    fi
}
function cleanup_extra_files {
    rm -rf /root/.ssh/*
    rm -f /opt/tfplenum/.editorconfig
    rm -rf /root/.kube
    rm -f /opt/tfplenum/deployer/playbooks/inventory.yml
    rm -f /opt/tfplenum/core/playbooks/inventory.yml
    rm -rf /opt/tfplenum/core/playbooks/files/*
    rm -f /etc/pki/ca-trust/source/anchors/webCA.crt
}

function clear_history {
    cat /dev/null > /root/.bash_history
    cat /dev/null > /home/assessor/.bash_history
}

function change_hostname {
    if [[ -z "$HOST_NAME" ]]; then
        return
    else
        hostnamectl set-hostname "$HOST_NAME"
    fi

}

function reset_sso {
    echo "-------------"
    echo "Resetting SSO"
    echo "-------------"
    systemctl stop dnsmasq
    systemctl disable dnsmasq
    rm -rf /opt/sso-idp/sso_admin_password.txt
    pushd "/opt/tfplenum/bootstrap/playbooks" > /dev/null
    make sso
    popd > /dev/null
    echo "-------------"
    echo "SSO Admin Password: `cat /opt/sso-idp/sso_admin_password.txt`"
    echo "-------------"
    }


parse_command_line_args
if [[ $RESET_CONTROLLER == "yes" || $RESET_NODE == "yes" ]]; then
    update_network_scripts
    clear_etc_hosts
    cleanup_extra_files
    reset_password
    clear_tfplenum_database
    change_hostname
    clear_history
    reset_sso
    reset_openvpn_server
    reset_dhcp
    reset_kickstart

elif [[ $RESET_TEMP_CONTROLLER == "yes" ]]; then
    echo "Cleaning Temporary Controller!"
    clear_etc_hosts
    cleanup_extra_files
    clear_tfplenum_database
    change_hostname
    clear_history
    reset_sso
    reset_openvpn_server
    reset_dhcp
    reset_kickstart
fi

echo "Cleanup complete!"
