#!/bin/bash
BASE_DIR=/etc/openvpn
rm -rf /var/log/openvpn.log

systemctl status crio > /dev/null 2>&1
status=$?

if [ $status -eq 0 ]; then
    crio_svc=`find /usr -type f -name crio.service`
    kubelet_svc=`find /usr -type f -name kubelet.service`

    # Stop Crio and Kubelet
    systemctl stop crio kubelet > /dev/null 2>&1
    # Reset crio service file
    sed -i '/^After=openvpn-client.service/ d' $crio_svc > /dev/null 2>&1
    sed -i '/^After=openvpn-client.service/ d' $kubelet_svc > /dev/null 2>&1

    # Start crio after openvpn-client connects
    sed -i '/^Documentation=.*/a After=openvpn-client.service' $crio_svc > /dev/null 2>&1
    sed -i '/^Documentation=.*/a After=openvpn-client.service' $kubelet_svc > /dev/null 2>&1
    systemctl daemon-reload > /dev/null 2>&1
fi

echo "Input the external IP of your PFSense firewall"
read ovpnIP

# Create temp client conf
default_client=$BASE_DIR/client_default.conf
if [ -f "$default_client" ]; then
    /usr/bin/cp -rf $default_client $BASE_DIR/client_temp.conf
    sed -i '/SET_ME_TO_PFSENSE_EXTERNAL_IP/s/.*remote.*/remote '$ovpnIP' 1194/' $BASE_DIR/client_temp.conf
    # Copy client temp conf to main client conf
    /usr/bin/cp -rf $BASE_DIR/client_temp.conf $BASE_DIR/client/client.conf
else
    client_path=$BASE_DIR/client/client.conf
    if [ -f "$client_path" ]; then
        sed -i '/SET_ME_TO_PFSENSE_EXTERNAL_IP/s/.*remote.*/remote '$ovpnIP' 1194/' $client_path
    else
        echo "Unable to find client.conf exiting..."
        exit 1
    fi
fi

restorecon -rv $BASE_DIR
# Enable openvpn-client service
systemctl enable openvpn-client
# Restart openvpn-client service
systemctl restart openvpn-client

echo "Waiting for vpn to connect"
sleep 20
val=$(/bin/netstat -i | grep tap0 | wc -l);
if [ "$val" -eq 1 ]; then
    echo "Vpn connected"
    if [ $status -eq 0 ]; then
        systemctl restart crio kubelet > /dev/null 2>&1
    fi
else
    echo "Unable to connect to vpn check /var/log/openvpn.log"
    echo "Then retry vpnsetup script"
fi

# Remove temp client conf
/usr/bin/rm -rf /etc/openvpn/client_temp.conf > /dev/null 2>&1
