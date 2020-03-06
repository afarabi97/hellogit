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
  kubectl exec ${WIKI_POD} -c wikijs -- tar xvzf /wiki/backup/${WIKI_TAR} -C /wiki/backup
  kubectl exec ${WIKI_POD} -c wikijs -- rm -f /wiki/backup/${WIKI_TAR}
  WIKI_TAR=$(kubectl exec ${WIKI_POD} -c wikijs -- ls /wiki/backup/ | grep 'wiki' | head -1)
}
# This will import only one tar file from the controller's /tmp/wiki directory
GET_PODS=$(eval "kubectl get pods")
WIKI_POD=$(echo $GET_PODS | awk -v RS=' ' '/^wikijs/')
WIKI_TAR=$(basename /tmp/wiki/*.tar.gz)
echo "Importing $WIKI_TAR from /tmp/wiki"
ACCESS_POD="kubectl cp /tmp/wiki/${WIKI_TAR} ${WIKI_POD}:/wiki/backup/ -c wikijs"
run_cmd $ACCESS_POD
# unzip all the pages of all the files
untar_pages
while [ $WIKI_TAR ]
do
  untar_pages
done
echo "Import Completed!"
