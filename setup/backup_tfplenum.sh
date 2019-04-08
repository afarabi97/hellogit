#!/bin/bash

STARTING_DIR=$(pwd)
DATE_STR=$(date +"%m-%d-%y_%H-%M")

function backup_tfplenum {
    mkdir -p /opt/tfplenum-frontend/backups    
    pushd /opt/tfplenum-frontend/backups > /dev/null
    mkdir backup/
    mongodump --archive=backup/tfplenum_database.gz --gzip --db tfplenum_database
    tar -czvf tfplenum_backup_${DATE_STR}.tar.gz backup/
    rm -rf backup/
    popd > /dev/null
}

backup_tfplenum
cd $STARTING_DIR
