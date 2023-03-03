#!/bin/bash

#
# This  script  is used by the SET_MIP python script to handle dis‐
# playing the FIREWALL information, specifically the ALLOW and  DE‐
# NIED  information.   Wi will show the FILTER DENY information and
# 20 lines after, ususally catching the FILTER ALLOW information
#
#	Version 1.0
#	Carl E. Burkhard
#	Initial version.
#

VERSION="1.0"

if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root"
   exit 1
fi

if [ "$1" == "-v" ] ;then 
    echo "$0 : Version ${VERSION}"
else

    FWCMD=`which nft 2>/dev/null`

    if [ -z $FWCMD ]; then
	    echo "Unable to find \`nft\` in path."
	    exit
    else
	    $FWCMD list ruleset inet | grep -A 20 -n "chain filter_IN_public_deny"
    fi
fi
