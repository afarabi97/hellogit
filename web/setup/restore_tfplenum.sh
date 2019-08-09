#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
FRONTEND_DIR="$SCRIPT_DIR/../"

function selectBackupFile {    
    options=($(ls $FRONTEND_DIR/backups))    
    prompt="Please select a file:"

    PS3="$prompt "
    select opt in "${options[@]}" "Quit" ; do 
        if (( REPLY == 1 + ${#options[@]} )) ; then
            exit

        elif (( REPLY > 0 && REPLY <= ${#options[@]} )) ; then
            echo  "You picked $opt which is file $REPLY"
            break

        else
            echo "Invalid option. Try another one."
        fi
    done    

    BACKUP_FILE=$FRONTEND_DIR/backups/$opt
}

function restoreMCPServer {
    pushd $FRONTEND_DIR/backups > /dev/null
    mongo tfplenum_database --eval "db.dropDatabase()"
    tar -xzvf $BACKUP_FILE
    cp -r backup/confluence/THISISCVAH/ /var/www/html/.
    cp -r backup/confluence/OJCCTM/ /var/www/html/.
    mongorestore --gzip --archive=backup/tfplenum_database.gz --db tfplenum_database
    rm -rf backup/
    popd > /dev/null
}

selectBackupFile
restoreMCPServer