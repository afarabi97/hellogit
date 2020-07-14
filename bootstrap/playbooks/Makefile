SHELL=/bin/bash

# Confirm Ansible is installed.
CHECK := $(shell command -v ansible-playbook 2> /dev/null)
INVENTORY ?= 'inventory.yml'
PLAYBOOK ?= 'site.yml'

.PHONY: execute_pre, frontend, install_angular, build_deploy_frontend, dip_bootstrap, sso, build_helm_charts, mip_bootstrap

# Default target, build *and* run tests
all:
ifndef CHECK
	$(error Ansible is not installed. Install Ansible with 'yum update -y && yum install -y ansible')
endif
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t execute_pre,frontend,sso,dip_bootstrap

execute_pre:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t execute_pre

frontend:
	ansible-playbook $(PLAYBOOK) -i localhost -t frontend

install_angular:
	ansible-playbook $(PLAYBOOK) -i localhost -t install_angular

build_deploy_frontend:
	ansible-playbook $(PLAYBOOK) -i localhost -t build_frontend,restart_frontend_services

nightly_clone_rebuild_frontend:
	ansible-playbook $(PLAYBOOK) -i localhost -t setup_python,build_frontend,restart_frontend_services

build_helm_charts:
	ansible-playbook $(PLAYBOOK) -i localhost -t helm

sso:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t sso

dip_bootstrap:
	@echo $(TFPLENUM_OS_TYPE)
	@echo $(TFPLENUM_SERVER_IP)
	@echo $(RHEL_SOURCE_REPO)

	$(if $(filter $(TFPLENUM_OS_TYPE),Centos),\
	(ansible-playbook $(PLAYBOOK) --connection=local -i localhost, -e '{ RHEL_SOURCE_REPO: "None" }' -e '{ server_ip: "$(TFPLENUM_SERVER_IP)" }' -t execute_pre,frontend,sso,dip_bootstrap),\
	(ansible-playbook $(PLAYBOOK) --connection=local -i localhost, -e '{ RHEL_SOURCE_REPO: "$(RHEL_SOURCE_REPO)" }' -e '{ server_ip: "$(TFPLENUM_SERVER_IP)" }' -t execute_pre,frontend,sso,dip_bootstrap))

mip_bootstrap:
	ansible-playbook $(PLAYBOOK) --connection=local -i localhost, -t execute_pre,frontend,sso,mip_bootstrap

pull_docker_images:
	ansible-playbook $(PLAYBOOK) --connection=local -i localhost, -e '{ server_ip: "$(TFPLENUM_SERVER_IP)" }' -t pull-docker-images
