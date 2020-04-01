SHELL=/bin/bash

# Confirm Ansible is installed.
CHECK := $(shell command -v ansible-playbook 2> /dev/null)
INVENTORY ?= 'inventory.yml'
DEPLOYER_INVENTORY ?= '/opt/tfplenum/core/playbooks/inventory.yml'
CORE_INVENTORY ?= '/opt/tfplenum/core/playbooks/inventory.yml'
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
	ansible-playbook $(PLAYBOOK) -i $(CORE_INVENTORY) --tags "all-stigs" --skip-tags "controller-stigs,sensor-stigs,server-stigs"

server-sensor-stigs:
	ansible-playbook $(PLAYBOOK) -i $(CORE_INVENTORY) --tags "server-stigs,sensor-stigs" --skip-tags "all-stigs,controller-stigs"

controller-stigs:
	ansible-playbook $(PLAYBOOK) -i $(CORE_INVENTORY) --tags "controller-stigs" --skip-tags "all-stigs,sensor-stigs,server-stigs"

server-stigs:
	ansible-playbook $(PLAYBOOK) -i $(CORE_INVENTORY) --tags "server-stigs" --skip-tags "all-stigs,controller-stigs,sensor-stigs"

sensor-stigs:
	ansible-playbook $(PLAYBOOK) -i $(CORE_INVENTORY) --tags "sensor-stigs" --skip-tags "all-stigs,controller-stigs,server-stigs"






