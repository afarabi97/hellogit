SHELL=/bin/bash

# Confirm Ansible is installed.
CHECK := $(shell command -v ansible-playbook 2> /dev/null)
INVENTORY ?= 'inventory.yml'
PLAYBOOK ?= 'site.yml'

.PHONY: kickstart profiles setup registry dnsmasq generate-profiles clonerepos-centos clonerepos-rhel

# Default target, build *and* run tests
all:
ifndef CHECK
	$(error Ansible is not installed. Install Ansible with 'yum update -y && yum install -y ansible')
endif
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t preflight,setup,dnsmasq,kickstart,profiles

dnsmasq:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t preflight,dnsmasq

kickstart:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t preflight,kickstart

profiles:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t preflight,profiles

setup:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t preflight,setup

generate-profiles:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t preflight,kickstart,profiles
