#!/bin/bash
# Generate configuration files for DIP build.

VERSION=3.0
#Version is major.minor format

FIREWALL_BASE_FILE="firewall.base.xml"
DELL_SWITCH_BASE_FILE="switch.base.dell.conf"
AUX_DELL_SWITCH_BASE_FILE="auxiliary.switch.base.dell.conf"

# If you want to have a script only run as root then set the owner to root and also set the execute bit.
function check_root {
  if [ `whoami` != "root" ]; then
    echo "This script must be run as root."
    exit
  fi
}

function decode_subnets {
  a=$(echo -n ${1:0:3} | sed -e  "s/^0\{0,2\}//g")
  b=$(echo -n ${1:3:3} | sed -e  "s/^0\{0,2\}//g")
  if [ $((a <= 127)) == "1" ]; then
    x="$(($a))"
    y="$(($b * 4 + 124))"
  else
    x="$(($a))"
    y="$((($b - 1) * 4))"
  fi
}

function validate {
  echo -n $1 | grep -q -E '^(((0[0-9][0-9]|1[0-2][0-7])(0[0-2][0-9]|0[0-3][0-2]))|((12[8-9]|1[3-9][0-9]|2[0-2][0-9]|23[012456789]|24[0-9]|25[0-3])(0[0-5][0-9]|06[0-4])))$'
}

# Function to output blank line
function blank_line {
  echo ""
}

# Function to output an ASCII line
function print_line {
  echo "-----------------------------------------------------------------------"
}

# Function to output press any key message
function any_key {
  read -n 1 -s -r -p "Press any key to continue"
}

# Function ASCII Menu Header
function menu_header {
  echo "   ___  _______  _____          ____     ";
  echo "  / _ \/  _/ _ \/ ___/__  ___  / _(_)__ _";
  echo " / // // // ___/ /__/ _ \/ _ \/ _/ / _ \`/";
  echo "/____/___/_/   \___/\___/_//_/_//_/\_, / ";
  echo "Version ${VERSION}                       /___/  ";
}

# Function to display the main main
function main_menu {
  menu_header
  blank_line
  echo "1 - Create Firewall configuration"
  echo "2 - Create Dell Switch configuration"
  echo "3 - Create auxiliary (secondary) DELL Switch configuration"
  echo "4 - Create Firewall, and Switch configuration"
  echo "X - Exit"
  echo "D - Debug this script"
  blank_line
  read -p "Please make a selection: " MENU_SELECTION
  case $MENU_SELECTION in
    1 ) menu_firewall ;;
    2 ) menu_dell_switch ;;
    3 ) menu_aux_dell_switch ;;
    4 ) menu_all ;;
    x|X ) exit ;;
    d|D ) menu_debug ;;
    * ) menu_invalid ;;
  esac
}

function menu_firewall {
  create_firewall_config
  clear
  echo "The firewall configuration has been created."
  blank_line
  any_key
  clear
  main_menu
}

function menu_dell_switch {
  create_dell_switch_config
  clear
  echo "The dell switch configuration has been created."
  blank_line
  any_key
  clear
  main_menu
}

function menu_aux_dell_switch {
  create_aux_dell_switch_config
  clear
  echo "The aux dell switch configuration has been created."
  blank_line
  any_key
  clear
  main_menu
}

function menu_all {
  create_all_config
  clear
  echo "The firewall configuration has been created."
  echo "The dell switch configuration has been created."
  echo "The aux dell switch configuration has been created."
  blank_line
  any_key
  clear
  main_menu
}

function menu_debug {
  clear
  echo "Firewall Base File = $FIREWALL_BASE_FILE"
  echo "Dell Switch Base File = $DELL_SWITCH_BASE_FILE"
  echo "Auxiliary Dell Switch Base File = $AUX_DELL_SWITCH_BASE_FILE"
  blank_line
  any_key
  clear
  main_menu
}

function menu_invalid {
  echo "Invalid Input"
  clear
  any_key
  main_menu
}

# Function to prompt user
function prompt_user {
  read -p 'Enter domain: ' DOMAIN
  while true;
  do
    read -p "Enter the string that encodes your subnets: " SUBNETS
    validate $SUBNETS
    if [ $? -eq 0 ]; then
      break
    fi
  done
  decode_subnets $SUBNETS
}

# Function to create Firewall configuration
function create_firewall_config {
  mkdir -p Kit_${SUBNETS}
  cp Firewall/$FIREWALL_BASE_FILE "Kit_${SUBNETS}/firewall.xml"
  sed -i "s/10\.101\.32/10\.${x}\.$((y))/g" "Kit_${SUBNETS}/firewall.xml"
  sed -i "s/10\.101\.35/10\.${x}\.$((y + 1))/g" "Kit_${SUBNETS}/firewall.xml"
  sed -i "s/10\.101\.37/10\.${x}\.$((y + 2))/g" "Kit_${SUBNETS}/firewall.xml"
  sed -i "s/10\.101\.33/10\.${x}\.$((y + 3))/g" "Kit_${SUBNETS}/firewall.xml"
  sed -i "s/\.lan/\.${DOMAIN}/g" "Kit_${SUBNETS}/firewall.xml"
  sed -i "s/<domain>lan<\/domain>/<domain>${DOMAIN}<\/domain>/g" "Kit_${SUBNETS}/firewall.xml"
}

# Function to create Dell Switch configuration
function create_dell_switch_config {
  mkdir -p Kit_${SUBNETS}
  cp Switch/$DELL_SWITCH_BASE_FILE Kit_${SUBNETS}/switch.conf 2>/dev/null
  blank_line
  sed -i "s/10\.101\.32/10\.${x}\.${y}/g" Kit_${SUBNETS}/switch.conf
  sed -i "s/10\.101\.35/10\.${x}\.$((y + 1))/g" Kit_${SUBNETS}/switch.conf
  sed -i "s/SW-DIP-101/SW-DIP-${SUBNETS}/g" Kit_${SUBNETS}/switch.conf
}

# Function to create aux Dell Switch configuration
function create_aux_dell_switch_config {
  mkdir -p Kit_${SUBNETS}
  cp Switch/$AUX_DELL_SWITCH_BASE_FILE Kit_${SUBNETS}/aux.switch.conf
  sed -i "s/10\.101\.32/10\.${x}\.${y}/g" Kit_${SUBNETS}/aux.switch.conf
  sed -i "s/10\.101\.35/10\.${x}\.$((y + 1))/g" Kit_${SUBNETS}/aux.switch.conf
  sed -i "s/SW-AUX-101/SW-AUX-${SUBNETS}/g" Kit_${SUBNETS}/aux.switch.conf
}

# Function to create all configurations
function create_all_config {
  create_firewall_config
  create_dell_switch_config
  create_aux_dell_switch_config
}

function review {
  echo "Global Kit ID: $SUBNETS"
  echo "Management: 10.${x}.$((y)).0/24"
  echo "Internal: 10.${x}.$((y + 1)).0/24"
  echo "DMZ: 10.${x}.$((y + 2)).0/24"
  echo "Spare: 10.${x}.$((y + 3)).0/24"
}

function main {
  clear
  menu_header
  blank_line
  prompt_user
  blank_line
  review
  blank_line
  any_key
  clear
  main_menu
}

main