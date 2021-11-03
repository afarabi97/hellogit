#!/bin/bash
ALL_COMPONENTS=$(ls components)
NEXUS_USER="tfplenum-bot"
NEXUS_PASSWORD=""
RPM_VERSION="3.7.0dev"
RPM_RELEASE_NUM="4"
REGISTRY_URL="https://nexus.sil.lab/repository/tfplenum-dev"

for component in $ALL_COMPONENTS
do
    binary_name=tfplenum-$component-$RPM_VERSION-$RPM_RELEASE_NUM.el8.x86_64.rpm
    cmd="curl -I --request DELETE --user \"$NEXUS_USER:$NEXUS_PASSWORD\" \"$REGISTRY_URL/$binary_name\""
    echo $cmd
    eval $cmd
done
