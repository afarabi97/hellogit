SHELL=/bin/bash

# Confirm Ansible is installed.
CHECK := $(shell command -v ansible-playbook 2> /dev/null)
CORE_INVENTORY ?= '../core/playbooks/inventory.yml'
MIP_INVENTORY ?= '../mip/mip-deployer/inventory.yml'
PLAYBOOK ?= 'rhel8-playbook-stig.yml'

# Default target, build *and* run tests
all:
ifndef CHECK
	$(error Ansible is not installed. Install Ansible with 'yum update -y && yum install -y ansible')
endif
	ansible-playbook $(PLAYBOOK) -i $(CORE_INVENTORY) --ask-pass

reinstall:
	ansible-playbook $(PLAYBOOK) -i $(CORE_INVENTORY) --ask-pass

all-stigs:
	ansible-playbook $(PLAYBOOK) -i $(CORE_INVENTORY) --tags "all-stigs"

#################
#	DIP STIGS	#
#################
dip-controller-stigs:
	ansible-playbook $(PLAYBOOK) --connection=local -i localhost, --tags "dip-controller-stigs"

dip-stigs:
	ansible-playbook $(PLAYBOOK) -i $(CORE_INVENTORY) --tags "dip-stigs"

dip-server-stigs:
	ansible-playbook $(PLAYBOOK) -i $(CORE_INVENTORY) --tags "dip-server-stigs"

dip-sensor-stigs:
	ansible-playbook $(PLAYBOOK) -i $(CORE_INVENTORY) --tags "dip-sensor-stigs"

#################
#	MIP STIGS	#
#################
mip-controller-stigs:
	ansible-playbook $(PLAYBOOK) --connection=local -i localhost, --tags "mip-controller-stigs"

mip-stigs:
	ansible-playbook $(PLAYBOOK) -i $(MIP_INVENTORY) --tags "mip-stigs"

#################
#	GIP STIGS	#
#################
gip-controller-stigs:
	ansible-playbook $(PLAYBOOK) --connection=local -i localhost, --tags "gip-controller-stigs"


gip-server-stigs:
	ansible-playbook $(PLAYBOOK) -i $(CORE_INVENTORY) --tags "gip-server-stigs"

gip-service-vm-stigs:
	ansible-playbook $(PLAYBOOK) --connection=local -i localhost, --tags "gip-service-vm-stigs"




#########################
#	REPO SERVER STIGS	#
#########################
repo-server-stigs:
	ansible-playbook $(PLAYBOOK) --connection=local -i localhost, --tags "repo-server-stigs"