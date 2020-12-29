#!/bin/bash

# Info #########################################################
#	File: generate_config.sh
#	Details: Generate configuration files for DIP build
#
VERSION=2.0
# VERSION_NUM='1.0'
# 	*Version is major.minor format
# 	*Major is updated when new capability is added
# 	*Minor is updated on fixes and improvements
#
# History ######################################################
# 1 Nov 2018
#   Initial Script Complete
# 5 Nov 2018
#   Polished Script and Added Arguments
# 19 Feb 2019
#   Added Dell Switch
# 21 Feb 2019
#   Reverted back to old style kit numbering
# 22 Apr 2020
#   Added MIP switch config build
#
# Description ##################################################
# Generates configuration files for DIP build from baseline
# configuration files
################################################################


# User Configurable Variables ##################################
# Script Variables
FIREWALL_BASE_FILE="firewall.base.xml"
ESX_BASE_FILE="esx.base.conf"
CISCO_SWITCH_BASE_FILE="switch.base.cisco.conf"
DELL_SWITCH_BASE_FILE="switch.base.dell.conf"
MIP_DELL_SWITCH_BASE_FILE="mip.switch.base.dell.conf"
USER_PROMPTED=
IP_SECOND_OCTET=
KIT_NUMBER=
# End User Configurable Variables ##############################

# Function to check script is ran as root
function check_root {
  if [ `whoami` != "root" ]; then
    echo "This script must be run as root."
    exit
  fi
}

# Function for Debug
function debug {
  menu_header
  echo "Current Variable Settings"
  blank_line
  echo "Firewall Base File= " $FIREWALL_BASE_FILE
  echo "ESX Base File = " $ESX_BASE_FILE
  echo "Cisco Switch Base File = " $CISCO_SWITCH_BASE_FILE
  echo "Dell Switch Base File = " $DELL_SWITCH_BASE_FILE
  echo "MIP Dell Switch Base File = " $MIP_DELL_SWITCH_BASE_FILE
  echo "User Prompted for Second IP Octet Already = " $USER_PROMPTED
  echo "User Entered IP Second Octet = " $IP_SECOND_OCTET
  blank_line
  any_key
  clear
}

# Function to output blank line
function blank_line {
  echo " "
}

# Function to output an ASCII line
function print_line {
  echo "-----------------------------------------------------------------------"
}

# Function to output press any key message
function any_key {
  read -p "Press any key to continue"
}

# Function ASCII Menu Header
function menu_header {
  echo "   ___  _______  _____          ____     ";
  echo "  / _ \/  _/ _ \/ ___/__  ___  / _(_)__ _";
  echo " / // // // ___/ /__/ _ \/ _ \/ _/ / _ \`/";
  echo "/____/___/_/   \___/\___/_//_/_//_/\_, / ";
  echo "Version ${VERSION}                       /___/  ";
  blank_line
}

# Function to display the main main
function main_menu {
  menu_header
  echo "This script provides the ability to automate the"
  echo "configuration of the DIP Kit.  Select an option"
  echo "from the menu below to generate the required configurations"
  blank_line
  echo "1 - Create ESXi configuration"
  echo "2 - Create Firewall configuration"
  echo "3 - Create Cisco Switch configuration"
  echo "4 - Create Dell Switch configuration"
  echo "5 - Create ESXi, Firewall, and Switch configuration"
  echo "6 - Create MIP Dell Switch configuration"
  echo "X - Exit"
  echo "D - Debug this script"
  blank_line
  read -p "Please make a selection: " MENU_SELECTION
  case $MENU_SELECTION in
    1 )clear && create_esx_config && blank_line && main_menu;;
    2 )clear && create_firewall_config && blank_line && main_menu;;
    3 )clear && create_cisco_switch_config && blank_line && main_menu;;
    4 )clear && create_dell_switch_config && blank_line && main_menu;;
    5 )clear && create_all_config && blank_line && main_menu;;
    6 )clear && create_mip_dell_switch_config && blank_line && main_menu;;
    x|X )exit;;
    d|D )clear && debug && blank_line && main_menu;;
    * ) echo "Invalid Input" && sleep 1 && clear && main_menu;;
  esac
}

# Function to check and verify basline files are present
function check_files {
  case $1 in
    ESX )
      clear
      menu_header
      echo "Checking that the file ESXi/$ESX_BASE_FILE exists"
      print_line
      if [ -e ESXi/$ESX_BASE_FILE ] ; then
        echo "ESXi Base file present"
        print_line
      else
        echo "ESXi Base file missing - Verify $ESX_BASE_FILE is in the ESXi"
        echo "folder - Exiting Script"
        blank_line
        exit
      fi
      ;;
    FIREWALL )
      clear
      menu_header
      echo "Checking that the file Firewall/$FIREWALL_BASE_FILE"
      if [ -e Firewall/$FIREWALL_BASE_FILE ] ; then
        echo "Firewall Base file present"
        print_line
      else
        echo "Firewall Base file missing - Verify $FIREWALL_BASE_FILE is in the"
        echo "Firewall folder - Exiting Script"
        blank_line
        exit
      fi
      ;;
    SWITCH_CISCO )
      clear
      menu_header
      echo "Checking that the file Switch/$CISCO_SWITCH_BASE_FILE"
      if [ -e Switch/$CISCO_SWITCH_BASE_FILE ] ; then
        echo "Switch Base file present"
        print_line
      else
        echo "Switch Base file missing - Verify $CISCO_SWITCH_BASE_FILE is in the"
        echo "Switch folder - Exiting Script"
        blank_line
        exit
      fi
      ;;
    SWITCH_DELL )
      clear
      menu_header
      echo "Checking that the file Switch/$DELL_SWITCH_BASE_FILE"
      if [ -e Switch/$DELL_SWITCH_BASE_FILE ] ; then
        echo "Switch Base file present"
        print_line
      else
        echo "Switch Base file missing - Verify $DELL_SWITCH_BASE_FILE is in the"
        echo "Switch folder - Exiting Script"
        blank_line
        exit
      fi
      ;;
    MIP_SWITCH_DELL )
      clear
      menu_header
      echo "Checking that the file Switch/$iMIP_DELL_SWITCH_BASE_FILE"
      if [ -e Switch/$MIP_DELL_SWITCH_BASE_FILE ] ; then
        echo "MIP Switch Base file present"
        print_line
      else
        echo "MIP Switch Base file missing - Verify $MIP_DELL_SWITCH_BASE_FILE is in the"
        echo "Switch folder - Exiting Script"
        blank_line
        exit
      fi
      ;;
  esac
}

# Function to prompt user to IP/Kit Information
function prompt_user {
  if [ -z $USER_PROMPTED ] ; then
    echo "Enter the domain for the kit (ie: lan, mission, custom.domain): "
    while true; do
      read -p "" DOMAIN
      if [[ ${DOMAIN:0:1} =~ [0-9] ]]; then
         echo "The domain can not start with a number"
      else
         break
      fi
      
    done
    echo "Enter the desired second octet of your IP Address (101 - 150)"
    read -p "this is your kit number and should be unique: " IP_SECOND_OCTET
    if [[ $IP_SECOND_OCTET -gt 150 ||  $IP_SECOND_OCTET -lt 101 || ! $IP_SECOND_OCTET =~ ^[0-9]+$ ]]; then
      echo "Please enter a number greater than 100 and less 151"
      blank_line
      prompt_user
    fi
    KIT_NUMBER=$(expr $IP_SECOND_OCTET - 100)
    USER_PROMPTED=true
  else
    echo "Using previously entered configuration to save time"
    print_line
  fi
}

# Function to create ESXi configuration
function create_esx_config {
  check_files ESX
  prompt_user
  echo "Creating ESXi configuration"
  mkdir -p Kit_${KIT_NUMBER}
  cp ESXi/$ESX_BASE_FILE Kit_${KIT_NUMBER}/esx.conf 2>/dev/null
  sed -i "s/10\.101\./10\.${IP_SECOND_OCTET}\./g" Kit_${KIT_NUMBER}/esx.conf
  sed -i "s/132/${KIT_NUMBER}32/g" Kit_${KIT_NUMBER}/esx.conf
  sed -i "s/134/${KIT_NUMBER}34/g" Kit_${KIT_NUMBER}/esx.conf
  sed -i "s/135/${KIT_NUMBER}35/g" Kit_${KIT_NUMBER}/esx.conf
  sed -i "s/136/${KIT_NUMBER}36/g" Kit_${KIT_NUMBER}/esx.conf
  sed -i "s/137/${KIT_NUMBER}37/g" Kit_${KIT_NUMBER}/esx.conf
  blank_line
  echo "Generated Kit_${KIT_NUMBER}/esx.conf"
  blank_line
  any_key
  clear
}

# Function to create Firewall configuration
function create_firewall_config {
  check_files FIREWALL
  prompt_user
  echo "Creating Firewall configuration"
  mkdir -p Kit_${KIT_NUMBER}
  cp Firewall/$FIREWALL_BASE_FILE Kit_${KIT_NUMBER}/firewall.xml 2>/dev/null
  sed -i "s/10\.101\./10\.${IP_SECOND_OCTET}\./g" Kit_${KIT_NUMBER}/firewall.xml
  # custom domain
  sed -i "s/\.lan/\.${DOMAIN}/g" Kit_${KIT_NUMBER}/firewall.xml
  sed -i "s/<domain>lan<\/domain>/<domain>${DOMAIN}<\/domain>/g" Kit_${KIT_NUMBER}/firewall.xml
  blank_line
  echo "Generated Kit_${KIT_NUMBER}/firewall.xml"
  blank_line
  any_key
  clear
}

# Function to create Cisco Switch configuration
function create_cisco_switch_config {
  check_files SWITCH_CISCO
  prompt_user
  echo "Creating Switch configuration"
  mkdir -p Kit_${KIT_NUMBER}
  cp Switch/$CISCO_SWITCH_BASE_FILE Kit_${KIT_NUMBER}/switch.conf 2>/dev/null
  sed -i "s/10\.101/10\.${IP_SECOND_OCTET}/g" Kit_${KIT_NUMBER}/switch.conf
  sed -i "s/DIP-101/DIP-${IP_SECOND_OCTET}/g" Kit_${KIT_NUMBER}/switch.conf
  sed -i "s/132/"${KIT_NUMBER}"32/g" Kit_${KIT_NUMBER}/switch.conf
  sed -i "s/134/"${KIT_NUMBER}"34/g" Kit_${KIT_NUMBER}/switch.conf
  sed -i "s/135/"${KIT_NUMBER}"35/g" Kit_${KIT_NUMBER}/switch.conf
  sed -i "s/136/"${KIT_NUMBER}"36/g" Kit_${KIT_NUMBER}/switch.conf
  sed -i "s/137/"${KIT_NUMBER}"37/g" Kit_${KIT_NUMBER}/switch.conf
  blank_line
  echo "Generated Kit_${KIT_NUMBER}/switch.conf"
  blank_line
  any_key
  clear
}

# Function to create MIP Dell Switch configuration
function create_mip_dell_switch_config {
  check_files MIP_SWITCH_DELL
  prompt_user
  echo "Creating MIP Switch configuration"
  mkdir -p Kit_${KIT_NUMBER}
  cp Switch/$MIP_DELL_SWITCH_BASE_FILE Kit_${KIT_NUMBER}/mip.switch.conf 2>/dev/null
  sed -i "s/10\.101/10\.${IP_SECOND_OCTET}/g" Kit_${KIT_NUMBER}/mip.switch.conf
  sed -i "s/MIP-101/MIP-${IP_SECOND_OCTET}/g" Kit_${KIT_NUMBER}/mip.switch.conf
  sed -i "s/132/"${KIT_NUMBER}"32/g" Kit_${KIT_NUMBER}/mip.switch.conf
  sed -i "s/134/"${KIT_NUMBER}"34/g" Kit_${KIT_NUMBER}/mip.switch.conf
  sed -i "s/135/"${KIT_NUMBER}"35/g" Kit_${KIT_NUMBER}/mip.switch.conf
  sed -i "s/136/"${KIT_NUMBER}"36/g" Kit_${KIT_NUMBER}/mip.switch.conf
  sed -i "s/137/"${KIT_NUMBER}"37/g" Kit_${KIT_NUMBER}/mip.switch.conf
  blank_line
  echo "Generated Kit_${KIT_NUMBER}/mip.switch.conf"
  blank_line
  any_key
  clear
}

# Function to create Dell Switch configuration
function create_dell_switch_config {
  check_files SWITCH_DELL
  prompt_user
  echo "Creating Switch configuration"
  mkdir -p Kit_${KIT_NUMBER}
  cp Switch/$DELL_SWITCH_BASE_FILE Kit_${KIT_NUMBER}/switch.conf 2>/dev/null
  sed -i "s/10\.101/10\.${IP_SECOND_OCTET}/g" Kit_${KIT_NUMBER}/switch.conf
  sed -i "s/DIP-101/DIP-${IP_SECOND_OCTET}/g" Kit_${KIT_NUMBER}/switch.conf
  sed -i "s/132/"${KIT_NUMBER}"32/g" Kit_${KIT_NUMBER}/switch.conf
  sed -i "s/134/"${KIT_NUMBER}"34/g" Kit_${KIT_NUMBER}/switch.conf
  sed -i "s/135/"${KIT_NUMBER}"35/g" Kit_${KIT_NUMBER}/switch.conf
  sed -i "s/136/"${KIT_NUMBER}"36/g" Kit_${KIT_NUMBER}/switch.conf
  sed -i "s/137/"${KIT_NUMBER}"37/g" Kit_${KIT_NUMBER}/switch.conf
  blank_line
  echo "Generated Kit_${KIT_NUMBER}/switch.conf"
  blank_line
  any_key
  clear
}

# Function to determine switch model/manufacture
function create_switch_config {
  menu_header
  echo "Which type of switch are you using?"
  blank_line
  echo "1 - Cisco Switch"
  echo "2 - Dell Switch"
  blank_line
  read -p "Please make a selection: " MENU_SELECTION
  case $MENU_SELECTION in
    1 )clear && create_cisco_switch_config && blank_line;;
    2 )clear && create_dell_switch_config && blank_line;;
    * ) echo "Invalid Input" && sleep 1 && clear && create_switch_config;;
  esac
}

# Function to create all configurations
function create_all_config {
  create_esx_config
  create_firewall_config
  create_switch_config
}

#Start the script
check_root
clear
if [[ ! $# == 1 ]] ; then
  main_menu
else
  case $1 in
    esx|Esx|ESX )create_esx_config;;
    switch|Switch|SWITCH|sw|Sw|SW )create_switch_config;;
    firewall|Firewall|FIREWALL|fw|Fw|FW )create_firewall_config;;
    all|All|ALL|a|A ) create_all_config;;
    -h|-?|h|? ) echo "Command Line Arguments: "
      echo "esx | ESX - Create an ESX Configuration file"
      echo "switch | SW - Create a Switch Configuration file"
      echo "firewall | FW - Create a Firewall Configuration file"
      echo "all | A - Create an ESX, Firewall, and SWitch Configuration file"
    ;;
    * )echo "Invalid Argument -  Valid arguments are: esx, switch, firewall, all";;
  esac
fi
