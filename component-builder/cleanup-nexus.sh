#!/bin/bash
ALL_COMPONENTS=$(ls components)
NEXUS_USER="tfplenum-bot"
NEXUS_PASSWORD=""
RPM_VERSION="3.7.0"
RPM_RELEASE_NUM="19"
REGISTRY_URL="https://nexus.sil.lab/repository/tfplenum-stable"

for component in $ALL_COMPONENTS repo
do
    binary_name=tfplenum-$component-$RPM_VERSION-$RPM_RELEASE_NUM.el8.x86_64.rpm
    cmd="curl -I --request DELETE --user \"$NEXUS_USER:$NEXUS_PASSWORD\" \"$REGISTRY_URL/$binary_name\""
    echo $cmd
    eval $cmd
done

binary_name=tfplenum-$RPM_VERSION-$RPM_RELEASE_NUM.el8.x86_64.rpm
cmd="curl -I --request DELETE --user \"$NEXUS_USER:$NEXUS_PASSWORD\" \"$REGISTRY_URL/$binary_name\""
echo $cmd
eval $cmd
