#!/bin/bash
STARTING_DIR=$(pwd)
DATE_STR=$(date +"%m-%d-%y_%H-%M")
PARAM_BACKUP_NAME=$1

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
WEB_DIR="$SCRIPT_DIR/../"

function backup_tfplenum {
    mkdir -p $WEB_DIR/backups
    pushd $WEB_DIR/backups > /dev/null
    mkdir backup/
    mongodump --archive=backup/tfplenum_database.gz --gzip --db tfplenum_database --excludeCollection version
    cp -rv /var/www/html/THISISCVAH/ backup/.
    cp -rv /var/www/html/OJCCTM/ backup/.
    cp -rv /var/www/html/pcaps/ backup/.
    if [ $PARAM_BACKUP_NAME ]; then
        tar -czvf $PARAM_BACKUP_NAME backup/
    else
        tar -czvf tfplenum_backup_${DATE_STR}.tar.gz backup/
    fi
    rm -rf backup/
    popd > /dev/null
}

backup_tfplenum
cd $STARTING_DIR
