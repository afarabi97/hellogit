SHELL=/bin/bash

# Confirm Ansible is installed.
CHECK := $(shell command -v ansible-playbook 2> /dev/null)
CORE_INVENTORY ?= '../core/playbooks/inventory/'
MIP_INVENTORY ?= '../mip/inventory/'
PLAYBOOK ?= 'site.yml'

# Default target, build *and* run tests
all:
ifndef CHECK
	$(error Ansible is not installed. Install Ansible with 'yum update -y && yum install -y ansible')
endif
	ansible-playbook $(PLAYBOOK) -i $(CORE_INVENTORY) --ask-pass

reinstall:
	ansible-playbook $(PLAYBOOK) -i $(CORE_INVENTORY) --ask-pass

all-stigs:
	ansible-playbook $(PLAYBOOK) -i $(CORE_INVENTORY)

#########################
#	Kit STIGS	#
#################
controller-stigs:
	ansible-playbook $(PLAYBOOK) --connection=local -i localhost,

kit-stigs:
	ansible-playbook $(PLAYBOOK) -i $(CORE_INVENTORY)

#########################
#	MIP STIGS	#
#########################
mip-stigs:
	ansible-playbook $(PLAYBOOK) -i $(MIP_INVENTORY)

#########################
#	GIP STIGS	#
#################

gip-server-stigs:
	ansible-playbook $(PLAYBOOK) -i $(CORE_INVENTORY)

gip-service-vm-stigs:
	ansible-playbook $(PLAYBOOK) --connection=local -i localhost,

#################################
#	REPO SERVER STIGS	#
#################################
repo-server-stigs:
	ansible-playbook $(PLAYBOOK) --connection=local -i localhost,
