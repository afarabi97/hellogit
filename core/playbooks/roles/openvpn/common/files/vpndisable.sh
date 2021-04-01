#!/bin/bash
echo "Disabling openvpn client"
# Remove from crio service
systemctl stop crio kubelet
# Reset crio service file
crio_svc=`find /usr -type f -name crio.service`
kubelet_svc=`find /usr -type f -name kubelet.service`
sed -i '/^After=openvpn-client.service/ d' $crio_svc
sed -i '/^After=openvpn-client.service/ d' $kubelet_svc
systemctl daemon-reload
# Disable openvpn-client service
systemctl disable openvpn-client
# Stop openvpn-client service
systemctl stop openvpn-client
systemctl restart crio kubelet

echo "Complete"
echo "Rerun vpnsetup.sh to setup sensor as remote"
