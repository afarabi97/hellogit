#!/bin/bash
export NETWORK_INTERFACE=$(nmcli device status | grep ethernet | head -n 1 | awk '{{ print $4,$5,$6 }}' 2>/dev/null)
export NETWORK_DEVICE=$(nmcli device status | grep ethernet | awk '{{ print $1 }}' 2>/dev/null)
export NETWORK_DRIVER=$(lspci -knn | grep "Kernel modules" | grep 'vmxnet\| e1000e' | awk '{{ print $3 }}' 2>/dev/null)

function prompt_runtype() {
    echo "Select run type:"
    echo "Disable: Disable Network Connection"
    echo "Enable: Enable Network Connection"
    if [[ -z "$RUN_TYPE" ]]; then
        select cr in "Disable" "Enable"; do
            case $cr in
                Disable ) export RUN_TYPE=disable; break;;
                Enable ) export RUN_TYPE=enable; break;;
            esac
        done
    fi
}

if [[ $(/usr/bin/id -u) -ne 0 ]]; then
    echo "Script must be run as root"
    exit
fi

prompt_runtype

if [[ $RUN_TYPE == "disable" ]]; then
   modprobe -r $NETWORK_DRIVER
   systemctl stop NetworkManager
   systemctl disable NetworkManager
fi

if [[ $RUN_TYPE == "enable" ]]; then
   systemctl start NetworkManager
   systemctl enable NetworkManager
   modprobe $NETWORK_DRIVER
   systemctl restart NetworkManager
fi