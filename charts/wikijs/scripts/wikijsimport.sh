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
function untar_pages() {
  echo "Unzipping $WIKI_TAR in the wikijs container"
  kubectl exec ${wiki_pod} -c wikijs -- tar xvzf /wiki/backup/${WIKI_TAR} -C /wiki/backup
  kubectl exec ${wiki_pod} -c wikijs -- rm -f /wiki/backup/${WIKI_TAR}
  WIKI_TAR=$(kubectl exec ${wiki_pod} -c wikijs -- ls /wiki/backup/ | grep 'wiki' | head -1)
}
# This will import only one tar file from the controller's /tmp/wiki directory
replicasets=$(kubectl get replicasets --output 'go-template={{range .items}}{{.metadata.name}}{{"\n"}}{{end}}')
pods=$(kubectl get pods --output 'go-template={{range .items}}{{.metadata.name}}{{"\n"}}{{end}}')
wiki_replicaset=$(echo "$replicasets" | grep wikijs)
wiki_pod=$(echo "$pods" | grep $wiki_replicaset)
WIKI_TAR=$(basename /tmp/wiki/*.tar.gz)
echo "Importing $WIKI_TAR from /tmp/wiki"
ACCESS_POD="kubectl cp /tmp/wiki/${WIKI_TAR} ${wiki_pod}:/wiki/backup/ -c wikijs"
run_cmd $ACCESS_POD
# unzip all the pages of all the files
untar_pages
while [ $WIKI_TAR ]
do
  untar_pages
done
echo "Import Completed!"
