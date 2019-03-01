SHELL=/bin/bash

# Confirm Ansible is installed.
CHECK := $(shell command -v ansible-playbook 2> /dev/null)
INVENTORY ?= 'inventory.yml'
PLAYBOOK ?= 'site.yml'
REMOVE_PLAYBOOK ?= 'remove-node.yml'
NODE ?= 'NONE'

.PHONY: all dev genkeys rerun common common-nokeys kubernetes ceph elasticsearch logstash kibana metricbeat bro moloch suricata kubernetes-rerun ceph-rerun elasticsearch-rerun logstash-rerun kibana-rerun metricbeat-rerun bro-rerun moloch-rerun suricata-rerun add-node

# Default target, build *and* run tests
all:
ifndef CHECK
	$(error Ansible is not installed. Install Ansible with 'yum update -y && yum install -y ansible')
endif
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) --ask-pass

preflight:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t preflight

dev:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) --ask-pass

rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY)

common:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) --ask-pass -t common

dnsmasq:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) --ask-pass -t dnsmasq

genkeys:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) --ask-pass -t genkeys

openvpn:
		ansible-playbook $(PLAYBOOK) -i $(INVENTORY) --ask-pass -t openvpn

kubernetes:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t kube-master,kube-node

ceph:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t ceph

elasticsearch:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t elasticsearch

logstash:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t logstash

kibana:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t kibana

metricbeat:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t metricbeat

bro:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t bro

moloch:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t moloch

suricata:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t suricata

rulesync:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t rulesync

janitor:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t janitor

dnsmasq-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t dnsmasq,preflight,common,kube-master,kube-node,ceph,storage,elasticsearch,logstash,kibana,metricbeat,bro,moloch,suricata

preflight-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t preflight,common,kube-master,kube-node,ceph,storage,elasticsearch,logstash,kibana,metricbeat,bro,moloch,suricata

common-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t common,kube-master,kube-node,ceph,storage,elasticsearch,logstash,kibana,metricbeat,bro,moloch,suricata

kubernetes-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t kube-master,kube-node,ceph,storage,elasticsearch,logstash,kibana,metricbeat,bro,moloch,suricata

ceph-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t ceph,storage,elasticsearch,logstash,kibana,metricbeat,bro,moloch,suricata

storage-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t storage,elasticsearch,logstash,kibana,metricbeat,bro,moloch,suricata

elasticsearch-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t elasticsearch,logstash,kibana,metricbeat,bro,moloch,suricata

logstash-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t logstash,kibana,metricbeat,bro,moloch,suricata

kibana-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t kibana,metricbeat,bro,moloch,suricata

metricbeat-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t metricbeat,bro,moloch,suricata

bro-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t bro,moloch,suricata

moloch-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t moloch,suricata

suricata-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t suricata

add-node:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -e node_to_add=$(NODE) -t preflight-add-node,setup-firewall,repos,update-networkmanager,update-dnsmasq-hosts,update-dns,yum-update,genkeys,preflight,common,vars-configmap --ask-pass
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -e node_to_add=$(NODE) -t docker -l $(NODE)
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -e node_to_add=$(NODE) -t pull_join_script,kube-node,ceph,es-scale,bro-scale,suricata-scale,moloch-scale,enable-sensor-monitor-interface
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t logstash

remove-node:
	ansible-playbook $(REMOVE_PLAYBOOK) -i $(INVENTORY)

change-interfaces:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -e update_kube_vars=true -t change-interfaces,vars-configmap

mumble:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t mumble

grr:
	ansible-playbook grr-only.yml -i $(INVENTORY) -t grr
