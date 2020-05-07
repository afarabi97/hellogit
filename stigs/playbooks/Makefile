SHELL=/bin/bash

# Confirm Ansible is installed.
CHECK := $(shell command -v ansible-playbook 2> /dev/null)
CORE_INVENTORY ?= '../../core/playbooks/inventory.yml'
# MIP_INVENTORY ?= '../../mip/mip-core/inventory.yml'
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
	ansible-playbook $(PLAYBOOK) -i $(CORE_INVENTORY) --tags "all-stigs" --skip-tags "dip-controller-stigs,sensor-stigs,server-stigs,gip-controller-stigs,gip-service-vm-stigs,mip-controller-stigs"

dip-controller-stigs:
	ansible-playbook $(PLAYBOOK) --connection=local -i localhost --tags "dip-controller-stigs" --skip-tags "all-stigs,sensor-stigs,server-stigs,gip-controller-stigs,gip-service-vm-stigs,mip-controller-stigs"

dip-stigs:
	ansible-playbook $(PLAYBOOK) -i $(CORE_INVENTORY) --tags "sensor-stigs,server-stigs" --skip-tags "all-stigs,dip-controller-stigs,gip-controller-stigs,gip-service-vm-stigs,mip-controller-stigs"

mip-controller-stigs:
	ansible-playbook $(PLAYBOOK) --connection=local -i localhost --tags "mip-controller-stigs" --skip-tags "all-stigs,dip-controller-stigs,server-stigs,sensor-stigs,gip-controller-stigs,gip-service-vm-stigs"

gip-controller-stigs:
	ansible-playbook $(PLAYBOOK) --connection=local -i localhost --tags "gip-controller-stigs" --skip-tags "all-stigs,dip-controller-stigs,server-stigs,sensor-stigs,gip-service-vm-stigs,mip-controller-stigs"

# gip-service-vm-stigs:
# 	ansible-playbook $(PLAYBOOK) --connection=local -i localhost --tags "gip-service-vm-stigs" --skip-tags "all-stigs,dip-controller-stigs,server-stigs,	sensor-stigs,mip-service-stigs"

server-stigs:
	ansible-playbook $(PLAYBOOK) -i $(CORE_INVENTORY) --tags "server-stigs" --skip-tags "all-stigs,dip-controller-stigs,sensor-stigs,gip-controller-stigs,gip-service-vm-stigs,mip-controller-stigs"

sensor-stigs:
	ansible-playbook $(PLAYBOOK) -i $(CORE_INVENTORY) --tags "sensor-stigs" --skip-tags "all-stigs,dip-controller-stigs,server-stigs,gip-controller-stigs,gip-service-vm-stigs,mip-controller-stigs"



