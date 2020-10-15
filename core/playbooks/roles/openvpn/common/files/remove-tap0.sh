#!/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/root/bin
/usr/sbin/openvpn --rmtun --dev tap0
exit 0
