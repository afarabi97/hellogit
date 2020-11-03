#!/bin/bash
sleep 60
cd /root
systemctl restart network NetworkManager
sed -i 's/read ovpnIP/ovpnIP=$1/g' vpnsetup.sh
bash vpnsetup.sh $1

systemctl enable openvpn-client
reboot


