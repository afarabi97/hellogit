#!/bin/bash

SHARE_UNAME="smbuser"
SHARE_PASSWD="default"
SHARE_IP="//10.11.102.145"
SHARE_MOUNT="Public/"
MULTI_BOOT_IMG="MULTIBOOT_20200110.IMG"
EXTERNAL_DRIVE="/dev/sdb"
BLOCK_SIZE="26144"
TYPE="xfs"
LABEL="Data"
DATA_PART="/dev/sdb2"
MOUNT_POINT="/mnt"
RSYNC_SOURCE="/home/christavo/Test"


if [ "$EUID" -ne 0 ]; then
  echo "Please run as root or use sudo."
  exit
fi

# Public dir needs to exist before mounting share
# TODO: add check to verify /Public exists


function mount_multiboot_share() {
  cd /home/christavo
  mount -t cifs -o username=$SHARE_UNAME,password=$SHARE_PASSWD $SHARE_IP/Public $SHARE_MOUNT
  cd /home/christavo/$SHARE_MOUNT
}

function burn_image_to_disk() {
  echo "Making sure external drive is not mounted before proceeding..."
  umount -q $EXTERNAL_DRIVE[12]
  sleep 3
  echo "Burning multiboot image to drive, this may take a while..."
  dd if=$MULTI_BOOT_IMG of=$EXTERNAL_DRIVE bs=$BLOCK_SIZE status=progress oflag=sync
  sleep 10
}

function create_data_partition() {
  echo "Creating Data partition..."
  mkfs -t $TYPE -f -L $LABEL $DATA_PART
  sleep 5
}

function rysnc_data_files() {
  echo "Copying files to Data partition..."
  mount $DATA_PART $MOUNT_POINT
  sleep 3
  rsync -azhSW --numeric-ids --info=progress2 $RSYNC_SOURCE $MOUNT_POINT
  umount $DATA_PART 
}

mount_multiboot_share
burn_image_to_disk
create_data_partition
rysnc_data_files