SHELL=/bin/bash

# Confirm Ansible is installed.
CHECK := $(shell command -v ansible-playbook 2> /dev/null)
CORE_INVENTORY ?= '../../core/playbooks/inventory.yml'
GIP_INVENTORY ?= 'gip-inventory.yml'
MIP_INVENTORY ?= 'mip-inventory.yml'
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
	ansible-playbook $(PLAYBOOK) -i $(CORE_INVENTORY) --tags "all-stigs" --skip-tags "controller-stigs,sensor-stigs,server-stigs,gip-service-vm-stigs,mip-controller-stigs"

server-sensor-stigs:
	ansible-playbook $(PLAYBOOK) -i $(CORE_INVENTORY) --tags "server-stigs,sensor-stigs" --skip-tags "all-stigs,controller-stigs,gip-service-vm-stigs,mip-controller-stigs"

controller-stigs:
	ansible-playbook $(PLAYBOOK) -i $(CORE_INVENTORY) --tags "controller-stigs" --skip-tags "all-stigs,sensor-stigs,server-stigs,gip-service-vm-stigs,mip-controller-stigs"

server-stigs:
	ansible-playbook $(PLAYBOOK) -i $(CORE_INVENTORY) --tags "server-stigs" --skip-tags "all-stigs,controller-stigs,sensor-stigs,gip-service-vm-stigs,mip-controller-stigs"

sensor-stigs:
	ansible-playbook $(PLAYBOOK) -i $(CORE_INVENTORY) --tags "sensor-stigs" --skip-tags "all-stigs,controller-stigs,server-stigs,gip-service-vm-stigs,mip-controller-stigs"

gip-service-stigs:
	ansible-playbook $(PLAYBOOK) -i $(GIP_INVENTORY) --tags "gip-service-vm-stigs" --skip-tags "all-stigs,controller-stigs,server-stigs,sensor-stigs,mip-service-stigs"

mip-controller-stigs:
	ansible-playbook $(PLAYBOOK) -i $(MIP_INVENTORY) --tags "mip-controller-stigs" --skip-tags "all-stigs,controller-stigs,server-stigs,sensor-stigs,gip-service-vm-stigs"






