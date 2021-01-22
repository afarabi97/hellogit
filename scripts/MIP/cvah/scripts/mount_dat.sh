#!/bin/sh
echo "Enter IP of mount"
read IP
echo "Enter password"
read pass
/usr/bin/mount -t cifs -o vers=1.0,username=MSSadmin,password=$pass //$IP/
