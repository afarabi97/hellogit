#!/bin/bash
rm -rf /var/log/openvpn.log
# Stop Crio and Kubelet
systemctl stop crio kubelet
# Reset crio service file
crio_svc=`find /usr -type f -name crio.service`
kubelet_svc=`find /usr -type f -name kubelet.service`
sed -i '/^After=openvpn-client.service/ d' $crio_svc
sed -i '/^After=openvpn-client.service/ d' $kubelet_svc
# Start crio after openvpn-client connects
sed -i '/^Documentation=.*/a After=openvpn-client.service' $crio_svc
sed -i '/^Documentation=.*/a After=openvpn-client.service' $kubelet_svc
systemctl daemon-reload

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

echo "Waiting for vpn to connect"
sleep 20
val=$(/bin/netstat -i | grep tap0 | wc -l);
if [ "$val" -eq 1 ]; then
echo "Vpn connected"
systemctl restart crio kubelet
else
echo "Unable to connect to vpn check /var/log/openvpn.log"
echo "Then retry vpnsetup script"
fi

# Remove temp client conf
/usr/bin/rm -rf /etc/openvpn/client_temp.conf
