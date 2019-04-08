#!/bin/bash

function selectBackupFile {    
    options=($(ls /opt/tfplenum-frontend/backups))    
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

    BACKUP_FILE=/opt/tfplenum-frontend/backups/$opt
}

function restoreMCPServer {
    pushd /opt/tfplenum-frontend/backups > /dev/null
    mongo tfplenum_database --eval "db.dropDatabase()"
    tar -xzvf $BACKUP_FILE
    mongorestore --gzip --archive=backup/tfplenum_database.gz --db tfplenum_database
    rm -rf backup/
    popd > /dev/null
}

selectBackupFile
restoreMCPServer
