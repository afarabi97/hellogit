#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
pushd $SCRIPT_DIR > /dev/null

function setup_ctrl {
    python pipeline.py \
    --system-name "DIP" \
    setup-controller \
    --vcenter-ipaddress "10.10.103.10" \
    --vcenter-username "svc.gitlab@sil.lab" \
    --vcenter-password 'MXFhejJ3c3ghUUFaQFdTWA==' \
    --vcenter-datacenter "DEV_Datacenter" \
    --repo-username "svc.gitlab" \
    --repo-password 'MXFhejJ3c3ghUUFaQFdTWA==' \
    --repo-url 'https://gitlab.sil.lab/tfplenum/tfplenum.git' \
    --branch-name 'bugfix/THISISCVAH-5261-ipaddresscollisionfixes' \
    --portgroup "12-Dev2-Navarro" \
    --network-id "10.40.12.0" \
    --dns-servers "10.10.101.11" "10.10.101.12" "10.11.101.13" \
    --vm-folder "Navarro" \
    --vm-template "dip-ctrl.lan" \
    --gateway "10.40.12.1" \
    --vm-prefix "navarro" \
    --run-type clone_from_nightly \
    --network-block-index 1 \
    --vm-datastore "dev-vol01"
}

function run_kickstart {
    python pipeline.py run-kickstart \
    --vcenter-username "svc.gitlab@sil.lab" \
    --vcenter-password 'MXFhejJ3c3ghUUFaQFdTWA==' \
    --vcenter-ipaddress "10.10.103.10" \
    --vcenter-datacenter "DEV_Datacenter" \
    --portgroup "12-Dev2-Navarro" \
    --network-id "10.40.12.0" \
    --dns-server "10.10.101.11" "10.10.101.12" "10.11.101.13" \
    --vm-folder "Navarro" \
    --gateway "10.40.12.1" \
    --num-servers 2 \
    --num-sensors 1 \
    --server-cpu 32 \
    --server-mem 30720 \
    --sensor-cpu 24 \
    --sensor-mem 30720 \
    --network-block-index 1 \
    --vm-prefix "navarro" \
    --vm-datastore "dev-vol01"
}

function run_kit {
    python pipeline.py run-kit
}

setup_ctrl
#run_kickstart
#run_kit

popd > /dev/null
