#!/bin/bash

# To use this script, set the environment variable "CONTAINER_TYPE" to one of
# CAPTURE, VIEWER, or BOOTSTRAP. The container will run the appropriate process.

if [[ ! -z "${CONTAINER_TYPE}" ]]; then
  if [[ "${CONTAINER_TYPE}" == "CAPTURE" ]]; then
    ulimit -l unlimited
    /data/moloch/bin/moloch-capture -c /data/moloch/etc/config.ini
  elif [[ "${CONTAINER_TYPE}" == "VIEWER" ]]; then
    cd /data/moloch/viewer
    /data/moloch/bin/node /data/moloch/viewer/viewer.js -c /data/moloch/etc/config.ini
  elif [[ "${CONTAINER_TYPE}" == "BOOTSTRAP" ]]; then
    /data/moloch/db/db.pl "${ELASTIC_FQDN}:9200" initnoprompt --replicas 1 --shardsPerNode 3
    /data/moloch/bin/moloch_add_user.sh -c /data/moloch/etc/config.ini "${MOLOCH_LOGIN}" "${MOLOCH_LOGIN}" "${MOLOCH_PASS}" --admin --webauth
  fi
fi
