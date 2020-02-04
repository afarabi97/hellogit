SHELL=/bin/bash

# Confirm Ansible is installed.
CHECK := $(shell command -v ansible-playbook 2> /dev/null)
INVENTORY ?= 'inventory.yml'
PLAYBOOK ?= 'site.yml'
REMOVE_PLAYBOOK ?= 'remove-node.yml'
NODE ?= 'NONE'

.PHONY: all dev genkeys rerun common common-nokeys kubernetes elasticsearch kibana metrics kubernetes-rerun elasticsearch-rerun metrics-rerun add-node chartmuseum-reinstall reinstall

# Default target, build *and* run tests
all:
ifndef CHECK
	$(error Ansible is not installed. Install Ansible with 'yum update -y && yum install -y ansible')
endif
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) --ask-pass

reinstall:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) --ask-pass

preflight:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t preflight

dev:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) --ask-pass

rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) --ask-pass

common:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) --ask-pass -t common

dnsmasq:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) --ask-pass -t dnsmasq

update_ctrl_dns:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t update_ctrl_dns

genkeys:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) --ask-pass -t genkeys

openvpn:
		ansible-playbook $(PLAYBOOK) -i $(INVENTORY) --ask-pass -t openvpn

kubernetes:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t kube-master,kube-node

helm:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t helm

chartmuseum:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t chartmuseum

elasticsearch:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t elasticsearch

kibana:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t kibana

metrics:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t metrics

moloch:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t moloch

logs:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t logs

node-health:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t node-health

dnsmasq-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t dnsmasq,preflight,common,kube-master,kube-node,elasticsearch,kibana,metrics,logs,moloch,frontend-health-metrics,es-license

preflight-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t preflight,common,kube-master,kube-node,elasticsearch,kibana,metrics,logs,moloch,frontend-health-metrics,es-license

common-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t common,kube-master,kube-node,elasticsearch,kibana,metrics,logs,moloch,frontend-health-metrics,es-license

kubernetes-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t kube-master,kube-node,elasticsearch,kibana,metrics,logs,moloch,frontend-health-metrics,es-license

storage-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t elasticsearch,kibana,metrics,logs,moloch,frontend-health-metrics,es-license

helm-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t helm,chartmuseum,elasticsearch,kibana,metrics,logs,moloch,frontend-health-metrics,es-license

chartmuseum-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t chartmuseum,elasticsearch,kibana,metrics,logs,moloch,frontend-health-metrics,es-license

elasticsearch-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t elasticsearch,kibana,metrics,logs,moloch,frontend-health-metrics,es-license

kibana-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t kibana,metrics,logs,moloch,frontend-health-metrics,es-license

metrics-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t metrics,logs,moloch,frontend-health-metrics,es-license

moloch-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t moloch,frontend-health-metrics --extra-vars,es-license

health-metrics-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t frontend-health-metrics,es-license

es-license:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t es-license

change-interfaces:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -e update_kube_vars=true -t change-interfaces
