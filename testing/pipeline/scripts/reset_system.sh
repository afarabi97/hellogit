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
  --iface=<iface_name>  The name of the network interface to reset.
  --hostname=<hostname> The hostname you wish to set the node to.
"
}

function parse_command_line_args {
    for e in "$ARGUMENTS"; do
        for i in $e; do
        case $i in
            -i=*|--iface=*)
            IFACE_NAME="${i#*=}"
            shift # past argument=value
            ;;
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

    if [[ -z $RESET_CONTROLLER && -z $RESET_NODE ]]; then
        echo "At least one --reset-controller or --reset-node flag is required."
        exit 2
    fi

    if [[ -z "$IFACE_NAME" ]]; then
        echo "The --iface=<iface_name> name is required. Please add this flag into your command line and try again."
        exit 2
    fi

    echo "IFACE_NAME  = ${IFACE_NAME}"
    echo "RESET_CTRL  = $RESET_CONTROLLER"
    echo "RESET_NODE  = $RESET_NODE"
}

function reset_password {
    rm -f /etc/passwd.lock
    rm -f /etc/shadow.lock
    run_cmd usermod --password Q9sIxtbggUGaw root
}

function update_network_scripts {
    find /etc/sysconfig -name "ifcfg-*" -not -name "ifcfg-lo" -delete
    local iface_path="/etc/sysconfig/network-scripts/ifcfg-${IFACE_NAME}"
    cat <<EOF > $iface_path
TYPE=Ethernet
PROXY_METHOD=none
BROWSER_ONLY=no
BOOTPROTO=dhcp
DEFROUTE=yes
IPV4_FAILURE_FATAL=no
IPV6INIT=no
IPV6_AUTOCONF=yes
IPV6_DEFROUTE=yes
IPV6_FAILURE_FATAL=no
IPV6_ADDR_GEN_MODE=stable-privacy
NAME=${IFACE_NAME}
ONBOOT=yes
EOF

}

function clear_etc_hosts {
    cat <<EOF > /etc/hosts
# Ansible managed
127.0.0.1 localhost localhost.localdomain localhost4 localhost4.localdomain4
EOF
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
    if [[ $RESET_CONTROLLER != "yes" ]]; then
        return
    fi
    wait_for_mongo

    collections=(
        'add_node_wizard'
        'catalog_saved_values'
        'kit'
        'kickstart'
        'console'
        'counters'
        'elastic_deploy'
        'kickstart_archive'
        'kit_archive'
        'last_jobs'
        'metrics'
        'notifications'
        'configurations'
        'celery_tasks'
    )

    for collection in "${collections[@]}"
    do
        echo "Clearing $collection"
        local cmd="db.${collection}.drop();"
        mongo --eval $cmd tfplenum_database
    done
}

function cleanup_extra_files {
    rm -rf /root/.ssh/*
    rm -f /opt/tfplenum/.editorconfig
    rm -f /root/.kube
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


parse_command_line_args
update_network_scripts
clear_etc_hosts
cleanup_extra_files
reset_password
clear_tfplenum_database
change_hostname
clear_history

echo "Cleanup complete!"
