SHELL=/bin/bash

# Confirm Ansible is installed.
CHECK := $(shell command -v ansible-playbook 2> /dev/null)
INVENTORY ?= '/opt/tfplenum/core/playbooks/inventory.yml'
PLAYBOOK ?= 'site.yml'


.PHONY:

# Default target, build *and* run tests
all:
ifndef CHECK
	$(error Ansible is not installed. Install Ansible with 'yum update -y && yum install -y ansible')
endif
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY)

