#!/bin/bash

# To use this script, set the environment variable "CONTAINER_TYPE" to one of
# CAPTURE, VIEWER, or BOOTSTRAP. The container will run the appropriate process.

if [[ ! -z "${CONTAINER_TYPE}" ]]; then
    if [[ "${CONTAINER_TYPE}" == "CAPTURE" ]]; then
        ulimit -l unlimited
        /data/moloch/bin/moloch-capture -c /data/moloch/etc/config.ini
        elif [[ "${CONTAINER_TYPE}" == "VIEWER" ]]; then
        cd /data/moloch/viewer
        # /data/moloch/bin/node /data/moloch/viewer/addUser.js --insecure -c /data/moloch/etc/config.ini ${MOLOCH_USER} ${MOLOCH_USER} ${MOLOCH_PASSWORD} --admin --webauth
        /data/moloch/bin/node /data/moloch/viewer/viewer.js -c /data/moloch/etc/config.ini
        elif [[ "${CONTAINER_TYPE}" == "BOOTSTRAP" ]]; then
        /data/moloch/db/db.pl --insecure https://${ELASTICSEARCH_USERNAME}:${ELASTICSEARCH_PASSWORD}@${ELASTICSEARCH_FQDN}:${ELASTICSEARCH_PORT} initnoprompt --shards ${NUM_OF_SHARDS} --replicas ${NUM_OF_REPLICAS} --shardsPerNode ${SHARDS_PER_NODE}
        /data/moloch/db/db.pl --insecure https://${ELASTICSEARCH_USERNAME}:${ELASTICSEARCH_PASSWORD}@${ELASTICSEARCH_FQDN}:${ELASTICSEARCH_PORT} ilm ${FORCE_MERGE} ${DELETE} --history ${HISTORY} --replicas ${ILM_REPLICAS}
        /data/moloch/db/db.pl --insecure https://${ELASTICSEARCH_USERNAME}:${ELASTICSEARCH_PASSWORD}@${ELASTICSEARCH_FQDN}:${ELASTICSEARCH_PORT} upgradenoprompt --shards ${NUM_OF_SHARDS} --replicas ${NUM_OF_REPLICAS} --shardsPerNode ${SHARDS_PER_NODE} --ilm
    fi
fi
