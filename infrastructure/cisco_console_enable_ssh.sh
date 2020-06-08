#!/bin/bash

# Info #########################################################
#	File: cisco_console_enable_ssh.sh
#	Details: Configure Cisco SW for IP Connectivity via console port
#
VERSION=1.1
# VERSION_NUM='1.0'
# 	*Version is major.minor format
# 	*Major is updated when new capability is added
# 	*Minor is updated on fixes and improvements
#
# History ######################################################
# 10 Oct 2018
#   Initial Script Complete
# 21 Feb 2019
#   Renamed script, changed the management port
#
# Description ##################################################
# Script connects to Cisco SW via USB->Console cable and
# configures the switch for initial IP management/communication.
################################################################


# User Configurable Variables ##################################
# Script Variables
DEV="/dev/ttyUSB0" # Serial device for output
SLEEP="0.5s" # Sleep after every command input to prevent overrun

# Switch Variables
VLAN="1" # VLAN for IP Management
VLANNAME="MGMT" # Name for IP Management VLAN
IP="10.0.0.1" # IP for IP Management
SNM="255.255.255.0" # Subnet mask for IP Management
DOMAIN="local" # Domain name for SSH key generation
USER="cisco" # Username for SSH connection
PASS="cisco" # Password for SSH connection
INT="g1/0/3" # Uplink Interface for IP Management
# End User Configurable Variables ##############################

# Function to check script is ran as root
function check_root {
  if [ `whoami` != "root" ]; then
    echo "This script must be run as root."
    sleep 1
    exit
  fi
}

# Function to configure serial device to have read/write permissions
function connect {
  chmod o+rw $DEV
  cat < $DEV &
}

# Function to return serial device to default permissions
function disconnect {
  chmod o-rw $DEV
  kill -9 $!
}

# Write function to send commands to the Serial device
function write {
  echo -e -n "$1 \r" > $DEV
  sleep $SLEEP
}

# Wake function to wake the switch or send an enter key
function wake {
  write "\r"
}

# Main function to configure the script
function configure {
  wake # Call wake to send an enter key to the serial device to init commnication
  write "enable"
  write "configure terminal"
  write "vlan $VLAN"
  write "name $VLANNAME"
  write "interface vlan $VLAN"
  write "ip address $IP $SNM"
  write "no shutdown"
  write "ip domain-name $DOMAIN"
  write "crypto key generate rsa mod 1024"
  sleep 10s # Need to wait longer than usual for SSH Keys to generate
  write "ip ssh version 2"
  write "ip scp server enable"
  write "username $USER priv 15 password $PASS"
  write "line vty 0 15"
  write "transport input ssh"
  write "login local"
  write "interface $INT"
  write "switchport mode access"
  write "switchport access vlan $VLAN"
  write "no shutdown"
  write "end"
}

# Check to see if the script is run as root
check_root

# Connect to serial device
connect

# Call configure function to start the process/script
configure

# Diconnect from serial device
disconnect
