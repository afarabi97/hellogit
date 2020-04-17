SHELL=/bin/bash

# Confirm Ansible is installed.
CHECK := $(shell command -v ansible-playbook 2> /dev/null)
INVENTORY ?= 'inventory.yml'
PLAYBOOK ?= 'site.yml'

.PHONY: execute_pre,setup_frontend,bootstrap

# Default target, build *and* run tests
all:
ifndef CHECK
	$(error Ansible is not installed. Install Ansible with 'yum update -y && yum install -y ansible')
endif
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t execute_pre,setup_frontend,bootstrap

execute_pre:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t execute_pre

setup_frontend:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t setup_frontend

bootstrap:
	@echo $(TFPLENUM_OS_TYPE)
	@echo $(TFPLENUM_SERVER_IP)
	@echo $(RHEL_SOURCE_REPO)

	$(if $(filter $(TFPLENUM_OS_TYPE),Centos),\
	(ansible-playbook $(PLAYBOOK) --connection=local -i localhost, -e '{ RHEL_SOURCE_REPO: "None" }' -e '{ server_ip: "$(TFPLENUM_SERVER_IP)" }' -t execute_pre,setup_frontend,bootstrap),\
	(ansible-playbook $(PLAYBOOK) --connection=local -i localhost, -e '{ RHEL_SOURCE_REPO: "$(RHEL_SOURCE_REPO)" }' -e '{ server_ip: "$(TFPLENUM_SERVER_IP)" }' -t execute_pre,setup_frontend,bootstrap))
