#!/bin/bash
# Generate configuration files for DIP build.

#Version is major.minor format
VERSION=4.0

function main {
  echo "   ___  _______  _____          ____     ";
  echo "  / _ \/  _/ _ \/ ___/__  ___  / _(_)__ _";
  echo " / // // // ___/ /__/ _ \/ _ \/ _/ / _ \`/";
  echo "/____/___/_/   \___/\___/_//_/_//_/\_, / ";
  echo "Version ${VERSION}                       /___/  ";
  read -p "Enter the domain: " DOMAIN
  read -p "Enter the global kit id: " GLOBAL_KIT_ID
  echo "1 - Create Firewall configuration"
  echo "2 - Create Dell Switch configuration"
  echo "3 - Create auxiliary (secondary) DELL Switch configuration"
  echo "4 - Create Firewall, and Switch configuration"
  read -p "Please make a selection: " CHOICE
  case $CHOICE in
    1 ) ./generate --domain ${DOMAIN} --global-kit-id ${GLOBAL_KIT_ID} --config firewall ;;
    2 ) ./generate --domain ${DOMAIN} --global-kit-id ${GLOBAL_KIT_ID} --config switch ;;
    3 ) ./generate --domain ${DOMAIN} --global-kit-id ${GLOBAL_KIT_ID} --config aux-switch ;;
    4 ) ./generate --domain ${DOMAIN} --global-kit-id ${GLOBAL_KIT_ID} --config firewall --config switch ;;
  esac
}

main