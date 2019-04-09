#!/bin/bash

echo "Input the external IP of your PFSense firewall"
read ovpnIP
sed -i '/remote/s/.*remote.*/remote '$ovpnIP' 1194/' /etc/openvpn/client/client.conf
