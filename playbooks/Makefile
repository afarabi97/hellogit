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

mumble:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t mumble

endgame:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t endgame

dnsmasq-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t dnsmasq,preflight,common,kube-master,kube-node,ceph,storage,elasticsearch,logstash,kibana,metricbeat,bro,moloch,suricata,janitor,mumble,endgame

preflight-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t preflight,common,kube-master,kube-node,ceph,storage,elasticsearch,logstash,kibana,metricbeat,bro,moloch,suricata,janitor,mumble,endgame

common-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t common,kube-master,kube-node,ceph,storage,elasticsearch,logstash,kibana,metricbeat,bro,moloch,suricata,janitor,mumble,endgame

kubernetes-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t kube-master,kube-node,ceph,storage,elasticsearch,logstash,kibana,metricbeat,bro,moloch,suricata,janitor,mumble,endgame

ceph-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t ceph,storage,elasticsearch,logstash,kibana,metricbeat,bro,moloch,suricata,janitor,mumble,endgame

storage-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t storage,elasticsearch,logstash,kibana,metricbeat,bro,moloch,suricata,janitor,mumble,endgame

elasticsearch-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t elasticsearch,logstash,kibana,metricbeat,bro,moloch,suricata,janitor,mumble,endgame

logstash-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t logstash,kibana,metricbeat,bro,moloch,suricata,janitor,mumble,endgame

kibana-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t kibana,metricbeat,bro,moloch,suricata,janitor,mumble,endgame

metricbeat-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t metricbeat,bro,moloch,suricata,janitor,mumble,endgame

bro-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t bro,moloch,suricata,janitor,mumble,endgame

moloch-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t moloch,suricata,janitor,mumble,endgame

suricata-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t suricata,janitor,mumble,endgame

janitor-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t janitor,mumble,endgame

mumble-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t mumble,endgame

engame-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t endgame

add-node:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -e node_to_add=$(NODE) -t preflight-add-node,setup-firewall,repos,update-networkmanager,update-dnsmasq-hosts,update-dns,yum-update,genkeys,preflight,common,vars-configmap --ask-pass
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -e node_to_add=$(NODE) -t docker -l $(NODE)
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -e node_to_add=$(NODE) -t pull_join_script,kube-node,ceph,es-scale,bro-scale,suricata-scale,moloch-scale,enable-sensor-monitor-interface
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t logstash

remove-node:
	ansible-playbook $(REMOVE_PLAYBOOK) -i $(INVENTORY)

change-interfaces:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -e update_kube_vars=true -t change-interfaces,vars-configmap

grr:
	ansible-playbook grr-only.yml -i $(INVENTORY) -t grr

#Requires LOGSTASH_URL and LOGSTASH_PORT to be specified on the command line, e.g.
#make winlogbeat LOGSTASH_URL=localhost LOGSTASH_PORT=9200 [ INCLUDE_GRR=TRUE [ GRR_PORT=8001 ] ]
#If GRR_PORT is not defined, GRR will not be included in the installer, even if INCLUDE_GRR is set to true.
winlogbeat:
ifeq ($(INCLUDE_GRR),TRUE)
	ansible-playbook winlogbeat.yml -i $(INVENTORY) -t winlogbeat --extra-vars "logstash_fw_url=$(LOGSTASH_URL) logstash_fw_port=$(LOGSTASH_PORT) grr_fw_port=$(GRR_PORT)"
else 
	ansible-playbook winlogbeat.yml -i $(INVENTORY) -t winlogbeat --extra-vars "logstash_fw_url=$(LOGSTASH_URL) logstash_fw_port=$(LOGSTASH_PORT) grr_fw_port=''"
endif