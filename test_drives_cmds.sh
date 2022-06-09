# /home/david/.virtualenvs/pipeline/bin/python testing/pipeline/pipeline.py run-export create-master-drive-hashes \
# --create-drive-type "MDT" \
# --drive-creation-version "3.7" \
# --username "drive_creator" \
# --password "V2UuYXJlLnRmcGxlbnVtNCQ=" \
# --ipaddress "10.10.102.10"

#python pipeline.py run-export create-drives --drive-creation-version "3.7" --username "drive_creator" --password "V2UuYXJlLnRmcGxlbnVtNCQ=" --ipaddress "10.10.102.10"

# /home/david/.virtualenvs/pipeline/bin/python testing/pipeline/pipeline.py run-export create-drives \
# --create-drive-type "Mixed" \
# --username "drive_creator" \
# --password "V2UuYXJlLnRmcGxlbnVtNCQ=" \
# --ipaddress "10.10.102.10" \
# --drive-creation-version "3.7" \
# --burn-multiboot yes

# /home/david/.virtualenvs/pipeline/bin/python testing/pipeline/pipeline.py run-export check-master-drive-hashes \
# --create-drive-type "Mixed" \
# --drive-creation-version "3.7" \
# --username "drive_creator" \
# --password "V2UuYXJlLnRmcGxlbnVtNCQ=" \
# --ipaddress "10.10.102.10"

# GIP_SERVICES_NETWORK_BLOCK_INDEX: 2
# GIP_SVC_TEMPLATE_TO_CLONE: "GIP SVC Template"


zip -r playbooks.zip gip/services/

/home/david/.virtualenvs/pipeline/bin/python testing/pipeline/pipeline.py \
gip-setup create-gip-service-vm \
--vcenter-ipaddress "10.10.103.10" \
--vcenter-datacenter "DEV_Datacenter" \
--vcenter-username "svc.gitlab@sil.lab" \
--vcenter-password "MXFhejJ3c3ghUUFaQFdTWA==" \
--vm-folder "Testing" \
--vm-password "d2UuYXJlLnRmcGxlbnVt" \
--portgroup "10-Dev-Automation-DO-NOT-USE" \
--gateway "10.40.10.1" \
--dns-servers 10.10.101.248 10.10.101.11 10.10.101.12 \
--vm-datastore "DEV-vSAN" \
--network-id "10.40.10.0" \
--vm-prefix "export-gip" \
--network-block-index 2 \
--export-password "d2UuYXJlLnRmcGxlbnVt" \
--vm-template "GIP SVC Template"
