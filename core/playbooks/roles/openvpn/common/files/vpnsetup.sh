#!/bin/bash

# Create temp client conf
/usr/bin/cp -rf /etc/openvpn/client_default.conf /etc/openvpn/client_temp.conf

echo "Input the external IP of your PFSense firewall"
read ovpnIP
sed -i '/SET_ME_TO_PFSENSE_EXTERNAL_IP/s/.*remote.*/remote '$ovpnIP' 1194/' /etc/openvpn/client_temp.conf

# Copy client temp conf to main client conf
/usr/bin/cp -rf /etc/openvpn/client_temp.conf /etc/openvpn/client/client.conf
# Enable openvpn-client service
systemctl enable openvpn-client
# Restart openvpn-client service
systemctl restart openvpn-client
# Remove temp client conf
/usr/bin/rm -rf /etc/openvpn/client_temp.conf
