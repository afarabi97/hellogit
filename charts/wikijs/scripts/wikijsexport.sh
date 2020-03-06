#!/bin/bash
if [ "$EUID" -ne 0 ]
  then echo "Please run as root or use sudo."
  exit
fi
function run_cmd {
    local command="$@"
    eval $command
    local ret_val=$?
    if [ $ret_val -ne 0 ]; then
        echo "$command returned error code $ret_val"
        exit 1
    fi
}
mkdir -p /tmp/wiki
rm -rf /tmp/wiki/*
GET_PODS=$(eval "kubectl get pods")
WIKI_POD=$(echo $GET_PODS | awk -v RS=' ' '/^wikijs/')
#TODO: grab the file path for accessing the pod
echo $WIKI_POD
EXPORT_WIKI="kubectl cp ${WIKI_POD}:/wiki/backup/_manual /tmp/wiki -c wikijs"
run_cmd $EXPORT_WIKI
echo "WikiJS pages have been exported to the controllers /tmp/wiki folder"
