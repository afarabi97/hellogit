SHELL=/bin/bash

# Confirm Ansible is installed.
CHECK := $(shell command -v ansible-playbook 2> /dev/null)
INVENTORY ?= 'inventory.yml'
PLAYBOOK ?= 'site.yml'
REMOVE_PLAYBOOK ?= 'remove-node.yml'
NODE ?= 'NONE'

.PHONY: all dev genkeys rerun common common-nokeys kubernetes elasticsearch kibana metrics kubernetes-rerun elasticsearch-rerun kibana-rerun metrics-rerun add-node

# Default target, build *and* run tests
all:
ifndef CHECK
	$(error Ansible is not installed. Install Ansible with 'yum update -y && yum install -y ansible')
endif
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) --ask-pass --extra-vars "run_option=install"

preflight:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t preflight

dev:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) --ask-pass

rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) --ask-pass --extra-vars "run_option=reinstall"

common:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) --ask-pass -t common

dnsmasq:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) --ask-pass -t dnsmasq --extra-vars "run_option=install"

update_ctrl_dns:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t update_ctrl_dns

genkeys:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) --ask-pass -t genkeys

openvpn:
		ansible-playbook $(PLAYBOOK) -i $(INVENTORY) --ask-pass -t openvpn

kubernetes:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t kube-master,kube-node --extra-vars "run_option=install"

helm:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t helm --extra-vars "run_option=install"

chartmuseum:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t chartmuseum --extra-vars "run_option=install"

elasticsearch:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t elasticsearch

kibana:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t kibana

metrics:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t metrics

moloch:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t moloch --extra-vars "run_option=install"

logs:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t logs --extra-vars "run_option=reinstall"

janitor:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t janitor

dnsmasq-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t dnsmasq,preflight,common,kube-master,kube-node,elasticsearch,kibana,metrics,logs,moloch,janitor

preflight-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t preflight,common,kube-master,kube-node,elasticsearch,kibana,metrics,logs,moloch,janitor

common-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t common,kube-master,kube-node,elasticsearch,kibana,metrics,logs,moloch,janitor

kubernetes-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t kube-master,kube-node,elasticsearch,kibana,metrics,logs,moloch,janitor --extra-vars "run_option=install"

storage-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t elasticsearch,kibana,metrics,logs,moloch,janitor

helm-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t helm --extra-vars "run_option=reinstall"
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t helm,chartmuseum,elasticsearch,kibana,metrics,logs,moloch,janitor --extra-vars "run_option=install"

chartmuseum-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t chartmuseum --extra-vars "run_option=reinstall"
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t chartmuseum,elasticsearch,kibana,metrics,logs,moloch,janitor --extra-vars "run_option=install"

elasticsearch-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t elasticsearch --extra-vars "run_option=reinstall"
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t elasticsearch,kibana,metrics,logs,moloch,janitor --extra-vars "run_option=install"

kibana-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t kibana,metrics,logs,moloch,janitor --extra-vars "run_option=install"

metrics-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t metrics,logs,moloch,janitor

moloch-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t moloch,janitor --extra-vars --extra-vars "run_option=install"

janitor-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t janitor

change-interfaces:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -e update_kube_vars=true -t change-interfaces,vars-configmap
