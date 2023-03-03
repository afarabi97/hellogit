#!/bin/bash

# Usage: ./mip-extend.sh
#
# Arguments: can define different drives to run against, default is sda
#
# Written by:	Matt Riensch, MSI INC.
#		Adam Bernstein, MSI INC.
# Adapted to the MIP by Carl Burkhard, MSI INC.
#
# Use this script to extend Sensors root partition to use full disk
# Version :1.0
# Written Dec 13, 2018

# Checks to see if running as root
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root"
   exit 1
fi

# Check to see are we a MIP or VIP
if [[ $(dmesg | grep Hypervisor) ]]; then
   echo "This is a VIP and extending the ROOT partition should not be done."
else

# PV is Physical Volume
# VG is Volume Group
# LV is Logical Volume

# Sets variable VG
    VG=$(vgs | tail -n1 | awk '{print $1}')

# Checks size of root (/) partition to determine if default size and check tosee it this has been done before
# FYI : Remove the trailing TENTHs part of the number.
    if [[ $(lsblk | grep disk | awk '{print $4}' | sed 's/G//g' | cut -d'.' -f1 | head -n 1) -gt 698 ]] &&
       [[ $(ls /dev/sda3 2>/dev/null; echo $?) -ne 0 ]];
    then

  # Creates new partion for the PV/LG
	(
	echo n # Add a new partition
	echo   # Primary partition (Accept default)
	echo   # Partition number (Accept default)
	echo   # First sector (Accept default: Will be next available sector on disk)
	echo   # Last sector (Accept default: varies, but will be last available sector)
	echo w # Write changes
	) | fdisk /dev/sda

  # Forces kernel to reload partition table
	partprobe

  # Addes new partition to PV
	pvcreate /dev/sda3

  # Extends VG with new partition
	vgextend "${VG}" /dev/sda3

  # Increases LV size by new partition
	lvextend /dev/"${VG}"/root /dev/sda3

  # Grows XFS to utilize full drive space (new partition)
	 xfs_growfs /dev/mapper/"${VG}"-root

    else
	echo "This script is either been already ran or is not needed.  Exiting"
    fi
fi
