SHELL=/bin/bash

# Confirm Ansible is installed.
CHECK := $(shell command -v ansible-playbook 2> /dev/null)
INVENTORY ?= 'inventory.yml'
PLAYBOOK ?= 'site.yml'

.PHONY: execute_pre, frontend, install_angular, build_frontend_only, build_deploy_frontend, setup_python_env, bootstrap, sso, build_helm_charts, nightly_clone_rebuild_frontend, pull_docker_images

# Default target, build *and* run tests
all:
ifndef CHECK
	$(error Ansible is not installed. Install Ansible with 'yum update -y && yum install -y ansible')
endif
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t execute_pre,frontend,sso,bootstrap

execute_pre:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t execute_pre

frontend:
	ansible-playbook $(PLAYBOOK) -i localhost -t frontend

install_node:
	ansible-playbook $(PLAYBOOK) -i localhost -t install_node

install_angular:
	ansible-playbook $(PLAYBOOK) -i localhost -t install_angular

build_frontend_only:
	ansible-playbook $(PLAYBOOK) -i localhost -t build_frontend

build_deploy_frontend:
	ansible-playbook $(PLAYBOOK) -i localhost -t build_frontend,restart_frontend_services

setup_python_env:
	ansible-playbook $(PLAYBOOK) -i localhost -t setup_python

nightly_clone_rebuild_frontend:
	ansible-playbook $(PLAYBOOK) -i localhost -t setup_python,build_frontend,restart_frontend_services

build_helm_charts:
	ansible-playbook $(PLAYBOOK) -i localhost -t helm

sso:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t sso

hosts_file:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t hosts_file

bootstrap:
	@echo $(TFPLENUM_SERVER_IP)
	@echo $(RHEL_SOURCE_REPO)
	(ansible-playbook $(PLAYBOOK) --connection=local -i localhost, -e '{ RHEL_SOURCE_REPO: "$(RHEL_SOURCE_REPO)" }' -e '{ server_ip: "$(TFPLENUM_SERVER_IP)" }' -t execute_pre,frontend,sso,bootstrap)

pull_docker_images:
	ansible-playbook $(PLAYBOOK) --connection=local -i localhost, -e '{ server_ip: "$(TFPLENUM_SERVER_IP)" }' -t pull-docker-images
