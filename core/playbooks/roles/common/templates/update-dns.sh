#!/bin/bash

# This script provides dns shortname look for kubernetes external services.
# Point your dns to the master server

# Make sure kubectl exists before even trying this awesomeness
if [ -f /usr/bin/kubectl ]; then
    TMP_FILE="/tmp/dnsmasq_kube_hosts"
    HOST_FILE="/etc/dnsmasq_hosts/kube_hosts"

    # Get all services with external ips and store in dnsmasq_kube_hosts
    kubectl get services --all-namespaces --no-headers=true | grep -v '<none>' | awk '{ print $5 " " $2 ".{{domain}}" }' > $TMP_FILE

    # check if file dnsmasq_kube_hosts exists if not create it
    if [ ! -f $HOST_FILE ]; then
        touch $HOST_FILE
    fi

    # check if file dnsmasq_kube_hosts.tmp exists if not create it
    if [ ! -f $TMP_FILE ]; then
        touch $TMP_FILE
    fi

    # Setup couple variables to compare later
    dns_list=$(cat $TMP_FILE)
    current_list=$(cat $HOST_FILE)

    # Compare the lists if they dont match
    # move dnsmasq_kube_hosts.tmp to dnsmasq_kube_hosts
    # and restart dnsmasq
    if [ "$dns_list" != "$current_list" ]; then
        mv $TMP_FILE $HOST_FILE
    fi
fi
