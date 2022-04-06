#!/bin/bash
 
# Documentation can be found here for this process manually
# https://help.sonatype.com/repomanager3/nexus-repository-administration/formats/yum-repositories/proxying-rhel-yum-repositories

base_dir="/root/gen_rhel_certs"
mkdir -p $base_dir

combined_keystore_path="$base_dir/new_combined_keystore.p12"
cert_key_path="$base_dir/certificate_and_key.p12"
cert_dir="/etc/pki/entitlement"
cert=`ls $cert_dir | grep -v key`
key=`ls $cert_dir | grep key`

nexus_server='nexus.sil.lab'
nexus_path='/app/new_combined_keystore.p12'

#Remove old certs
rm -f $cert_dir/*

# Test redhat cdn with current entitlement cert and key
# If this does not return a 200 then we assume the entitlement certs are invalid
if [ $(curl -LI -k --cert $cert_dir/$cert --key $cert_dir/$key https://cdn.redhat.com/content/dist/rhel8/8/x86_64/codeready-builder/os/repodata/repomd.xml -o /dev/null -w '%{http_code}\n' -s) != "200" ]; then

  echo "Cert/Key are invalid....trying to regenerate rhel entitlement certs";
  # Remove old keystore and combined cert/key
  rm -rf $combined_keystore_path $cert_key_path
  # Regenerate entitlement certs
  # If refresh doesnt work then try to unsub and resubscribe
  # 1. subscription-manager unregister
  # 2. subscription-manager register
  # 3. subscription-manager attach --auto
  subscription-manager refresh > /dev/null 2>&1
  new_key=`ls $cert_dir | grep key`
  new_cert=`ls $cert_dir | grep -v key`

  # Combine the cert and key into a p12 file
  echo "Generate p12"
  openssl pkcs12 -export -in $cert_dir/$new_cert -inkey $cert_dir/$new_key -name certificate_and_key -out $cert_key_path -passout pass:password > /dev/null 2>&1

  # Create a keystore from the combined p12
  echo "Generate keystore with p12"
  keytool -importkeystore -srckeystore $cert_key_path -srcstoretype PKCS12 -srcstorepass password -deststorepass password -destkeystore $combined_keystore_path -deststoretype PKCS12 > /dev/null 2>&1

  echo "copy keystore to nexus"
  scp $combined_keystore_path root@$nexus_server:$nexus_path

  echo "Restart Nexus service"
  ssh root@$nexus_server "systemctl restart nexus"
fi
