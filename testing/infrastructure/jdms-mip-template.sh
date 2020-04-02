#!/bin/bash
# These are the commands I would run if I wanted to create the MIP template again.

# --- Virtual Machine ---
# CPU: 4 CPU(s)
# Memory: 8192 MB
# Hard disk 1: 250 GB
# OS: RHEL 7.7

read -s -p "Enter your organization: " ORG
read -s -p "Enter your activationkey: " ACTIVATIONKEY

subscription-manager register --org ${ORG} --activationkey ${ACTIVATIONKEY}

yum install --assumeyes perl
yum install --assumeyes httpd

mkdir /var/www/html/MIP
cd /var/www/html/MIP

curl --remote-name http://misc.labrepo.sil.lab/MIP/cpt-cvah-mod.tar.gz
curl --remote-name http://misc.labrepo.sil.lab/MIP/mdt-cvah.tar.gz

yum clean all
subscription-manager unregister
