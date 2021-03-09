SHELL=/bin/bash

# Confirm Ansible is installed.
CHECK := $(shell command -v ansible-playbook 2> /dev/null)
INVENTORY ?= 'inventory.yml'
PLAYBOOK ?= 'site.yml'
REMOVE_PLAYBOOK ?= 'remove-node.yml'
NODE ?= 'NONE'

.PHONY: all system-info dev genkeys rerun common common-nokeys kubernetes storage certificate_authority sso elasticsearch kibana metrics kubernetes-rerun certificate_authority-rerun sso-rerun elasticsearch-rerun metrics-rerun add-node chartmuseum-reinstall reinstall

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

genkeys:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) --ask-pass -t genkeys

openvpn:
		ansible-playbook $(PLAYBOOK) -i $(INVENTORY) --ask-pass -t openvpn

certificate_authority:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t certificate_authority

sso:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t sso

helm:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t helm

chartmuseum:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t chartmuseum

elasticsearch:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t elasticsearch

kubernetes:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t kubernetes

storage:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t storage

kibana:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t kibana

audit:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t audit

metrics:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t metrics

arkime:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t arkime

logs:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t logs

node-health:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t node-health

preflight-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t preflight,common,crio,kube-master,kube-node,certificate_authority,sso,helm,storage,chartmuseum,elasticsearch,kibana,audit,metrics,logs,arkime,node-health,run-filebeat-setup,run-winlogbeat-setup

common-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t common,crio,kube-master,kube-node,certificate_authority,sso,helm,storage,chartmuseum,elasticsearch,kibana,audit,metrics,logs,arkime,node-health,run-filebeat-setup,run-winlogbeat-setup

crio-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t kubernetes,certificate_authority,sso,helm,storage,chartmuseum,elasticsearch,kibana,audit,metrics,logs,arkime,node-health,run-filebeat-setup,run-winlogbeat-setup

kubernetes-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t kubernetes,certificate_authority,sso,helm,storage,chartmuseum,elasticsearch,kibana,audit,metrics,logs,arkime,node-health,run-filebeat-setup,run-winlogbeat-setup

certificate_authority-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t certificate_authority,sso,helm,storage,chartmuseum,elasticsearch,kibana,audit,metrics,logs,arkime,node-health,run-filebeat-setup,run-winlogbeat-setup

sso-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t sso,helm,storage,chartmuseum,elasticsearch,kibana,audit,metrics,logs,arkime,node-health,run-filebeat-setup

helm-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t helm,storage,chartmuseum,elasticsearch,kibana,audit,metrics,logs,arkime,node-health,run-filebeat-setup,run-winlogbeat-setup

storage-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t storage,chartmuseum,elasticsearch,kibana,audit,metrics,logs,arkime,node-health,run-filebeat-setup,run-winlogbeat-setup

chartmuseum-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t chartmuseum,elasticsearch,kibana,audit,metrics,logs,arkime,node-health,run-filebeat-setup,run-winlogbeat-setup

elasticsearch-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t elasticsearch,kibana,audit,metrics,logs,arkime,node-health,run-filebeat-setup,run-winlogbeat-setup

kibana-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t kibana,audit,metrics,logs,arkime,node-health,run-filebeat-setup,run-winlogbeat-setup

audit-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t audit,metrics,logs,arkime,node-health,run-filebeat-setup,run-winlogbeat-setup

metrics-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t metrics,logs,arkime,node-health,run-filebeat-setup,run-winlogbeat-setup

arkime-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t arkime,node-health,run-filebeat-setup,run-winlogbeat-setup

health-metrics-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t node-health,run-filebeat-setup,run-winlogbeat-setup

filebeat-setup:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t run-filebeat-setup

filebeat-setup-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t run-filebeat-setup,run-winlogbeat-setup

filebeat_exernal_setup:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t load_filebeat_external_items

winlogbeat-setup:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t run-winlogbeat-setup

change-interfaces:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -e update_kube_vars=true -t change-interfaces

