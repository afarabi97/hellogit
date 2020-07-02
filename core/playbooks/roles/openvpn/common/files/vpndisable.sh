#!/bin/bash
echo "Disabling openvpn client"

# Disable openvpn-client service
systemctl disable openvpn-client
# Stop openvpn-client service
systemctl stop openvpn-client

echo "Complete"
echo "Rerun vpnsetup.sh to setup sensor as remote"
