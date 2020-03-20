#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
pushd $SCRIPT_DIR > /dev/null

function setup_ctrl {
    python pipeline.py setup-controller \
    --vcenter-ipaddress "10.10.103.10" \
    --vcenter-username "svc.gitlab@sil.lab" \
    --vcenter-password 'MXFhejJ3c3ghUUFaQFdTWA==' \
    --vcenter-datacenter "DEV_Datacenter" \
    --repo-username "svc.gitlab" \
    --repo-password 'MXFhejJ3c3ghUUFaQFdTWA==' \
    --repo-url 'https://gitlab.sil.lab/tfplenum/tfplenum.git' \
    --branch-name 'THISISCVAH-4233-refactortestytester' \
    --portgroup "12-Dev2-Navarro" \
    --network-id "10.40.12.0" \
    --dns-server "10.10.101.11" "10.10.101.12" "10.11.101.13" \
    --vm-folder "Navarro" \
    --vm-template "DIP Test Template" \
    --gateway "10.40.12.1" \
    --vm-hostname "navarro2-ctrl.lan" \
    --branch-name "THISISCVAH-4233-refactortestytester" \
    --run-type build_from_scratch \
    --vm-datastore "NVMe Storage"
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
    --num-sensors 2 \
    --server-cpu 32 \
    --server-mem 30720 \
    --sensor-cpu 24 \
    --sensor-mem 30720 \
    --vm-datastore "NVMe Storage"
}

setup_ctrl
run_kickstart

popd > /dev/null
