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
mkdir -p /tmp/wiki
rm -rf /tmp/wiki/*
replicasets=$(kubectl get replicasets --output 'go-template={{range .items}}{{.metadata.name}}{{"\n"}}{{end}}')
pods=$(kubectl get pods --output 'go-template={{range .items}}{{.metadata.name}}{{"\n"}}{{end}}')
wiki_replicaset=$(echo "$replicasets" | grep wikijs)
wiki_pod=$(echo "$pods" | grep $wiki_replicaset)
#TODO: grab the file path for accessing the pod
echo $wiki_pod
EXPORT_WIKI="kubectl cp ${wiki_pod}:/wiki/backup/_manual /tmp/wiki -c wikijs"
run_cmd $EXPORT_WIKI
echo "WikiJS pages have been exported to the controllers /tmp/wiki folder"
