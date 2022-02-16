#!/bin/bash

pushd "/opt/tfplenum/web/frontend" > /dev/null

function run_cmd {
    local command="$@"
    eval $command
    local ret_val=$?
    if [ $ret_val -ne 0 ]; then
        echo "$command returned error code $ret_val"
        exit 1
    fi
}

IS_CHROM_SETUP=/etc/chrome_setup
#
if [ ! -f "$IS_CHROM_SETUP" ]; then

    mkdir ~/repos_backup
    mv /etc/yum.repos.d/* ~/repos_backup
    curl -o /etc/yum.repos.d/nexus-rhel8.repo https://nexus.sil.lab/repository/tfplenum-repo/nexus-rhel8.repo

    cat <<EOF > /etc/yum.repos.d/google-chrome.repo
[google-chrome]
name=google-chrome
baseurl=http://dl.google.com/linux/chrome/rpm/stable/x86_64
enabled=1
gpgcheck=1
gpgkey=https://dl-ssl.google.com/linux/linux_signing_key.pub
EOF

    run_cmd yum install -y google-chrome-stable
    touch /etc/chrome_setup
    rm -f /etc/yum.repos.d/*
    mv ~/repos_backup/* /etc/yum.repos.d/
    rm -rf ~/repos_backup/
fi

npm run test-chromeheadless

popd > /dev/null
