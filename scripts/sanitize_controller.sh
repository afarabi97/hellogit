#!/bin/bash

if [[ $(/usr/bin/id -u) -ne 0 ]]; then
    echo "Not running as root"
    exit
fi
echo ""
echo "This script will sanitize the code to remove traces of names and CVA/H."
echo "This script must be run prior to kitckstart and kit deployment."
echo "Once run this system will be unable to be patched or updated in place."
echo ""
read -p "Press any key to continue or CTRL-C to exit." continue_prompt
echo ""
echo "Deleting uneeded files and directories"

sed -i 's|<img class="logo".*||g' /opt/tfplenum/web/frontend/src/app/portal/portal.component.html
echo "Good Luck" > /opt/tfplenum/web/frontend/src/app/support/support.component.html

rm /opt/tfplenum/web/frontend/src/assets/logo.png
rm /opt/tfplenum/web/frontend/src/assets/badge.png
rm -rf /opt/tfplenum/bootstrap.sh
rm -rf /opt/tfplenum/.git
rm -rf /opt/tfplenum/.gitattributes
rm -rf /opt/tfplenum/.gitignore
rm -rf /opt/tfplenum/.gitlab-ci.yml
rm -rf /opt/tfplenum/gitlab
rm -rf /opt/tfplenum/testing
rm -rf /opt/tfplenum/images
rm -rf /opt/tfplenum/mip
rm -rf /opt/tfplenum/gip
rm -rf /opt/tfplenum/infrastructure

# find /opt/tfplenum/ -type f -exec sed -i "s|CVA/H SSO|SSO|" {} +
# find /opt/tfplenum/ -type f -exec sed -i "s|CVAH SSO|SSO|" {} +
# find /opt/tfplenum/ -type f -exec sed -i "s|CVAH-SSO|SSO|" {} +
find /opt/tfplenum/ -type f -exec sed -i "s|CVA/?H[- ]?SSO|SSO|" {} +

cd /opt/tfplenum/bootstrap/playbooks/
echo "Rebuilding Frontend"
make build_deploy_frontend
echo "Rebuilding SSO"
make sso
service shbd restart
echo "Rebuilding Helm Charts"
for dir in /opt/tfplenum/charts/*/; do
    helm package "$dir" -d /var/www/html/offlinerepo/charts
done

echo "Self-deleting Script"
rm -- "$0"
