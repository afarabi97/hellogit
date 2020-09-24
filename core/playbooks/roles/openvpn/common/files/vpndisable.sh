#!/bin/bash
echo "Disabling openvpn client"
# Remove from crio service
systemctl stop crio kubelet
# Reset crio service file
sed -i '/^After=openvpn-client.service/ d' /usr/lib/systemd/system/crio.service
sed -i '/^After=openvpn-client.service/ d' /usr/lib/systemd/system/kubelet.service
systemctl daemon-reload
# Disable openvpn-client service
systemctl disable openvpn-client
# Stop openvpn-client service
systemctl stop openvpn-client
systemctl restart crio kubelet

echo "Complete"
echo "Rerun vpnsetup.sh to setup sensor as remote"
