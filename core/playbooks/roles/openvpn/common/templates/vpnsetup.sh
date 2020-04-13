#!/bin/bash

echo "Input the external IP of your PFSense firewall"
read ovpnIP
sed -i '/SET_ME_TO_PFSENSE_EXTERNAL_IP/s/.*remote.*/remote '$ovpnIP' 1194/' /etc/openvpn/client/client.conf
