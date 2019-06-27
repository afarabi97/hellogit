SHELL=/bin/bash

# Confirm Ansible is installed.
CHECK := $(shell command -v ansible-playbook 2> /dev/null)
INVENTORY ?= 'inventory.yml'
PLAYBOOK ?= 'site.yml'
REMOVE_PLAYBOOK ?= 'remove-node.yml'
NODE ?= 'NONE'

.PHONY: all dev genkeys rerun common common-nokeys kubernetes elasticsearch logstash kibana metrics bro moloch suricata kubernetes-rerun elasticsearch-rerun logstash-rerun kibana-rerun metrics-rerun bro-rerun moloch-rerun suricata-rerun add-node

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
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t kube-master,kube-node --extra-vars "run_option=install"

helm:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t helm --extra-vars "run_option=install"

chartmuseum:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t chartmuseum --extra-vars "run_option=install"

elasticsearch:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t elasticsearch

logstash:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t logstash

kibana:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t kibana

metrics:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t metrics

bro:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t bro

moloch:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t moloch

suricata:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t suricata --extra-vars "run_option=install"

logs:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t logs --extra-vars "run_option=reinstall"

janitor:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t janitor

mumble:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t mumble

endgame:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t endgame

dnsmasq-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t dnsmasq,preflight,common,kube-master,kube-node,elasticsearch,logstash,kibana,metrics,bro,moloch,suricata,janitor,mumble,endgame

preflight-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t preflight,common,kube-master,kube-node,elasticsearch,logstash,kibana,metrics,bro,moloch,suricata,janitor,mumble,endgame

common-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t common,kube-master,kube-node,elasticsearch,logstash,kibana,metrics,bro,moloch,suricata,janitor,mumble,endgame

kubernetes-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t kube-master,kube-node,elasticsearch,logstash,kibana,metrics,bro,moloch,suricata,janitor,mumble,endgame --extra-vars "run_option=install"

storage-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t elasticsearch,logstash,kibana,metrics,bro,moloch,suricata,janitor,mumble,endgame

helm-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t helm --extra-vars "run_option=reinstall"
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t helm,chartmuseum,elasticsearch,logstash,kibana,metrics,bro,moloch,suricata,janitor,mumble,endgame --extra-vars "run_option=install"

chartmuseum-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t chartmuseum --extra-vars "run_option=reinstall"
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t chartmuseum,elasticsearch,logstash,kibana,metrics,bro,moloch,suricata,janitor,mumble,endgame --extra-vars "run_option=install"

elasticsearch-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t elasticsearch --extra-vars "run_option=reinstall"
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t elasticsearch,logstash,kibana,metrics,bro,moloch,suricata,janitor,mumble,endgame --extra-vars "run_option=install"

logstash-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t logstash,kibana,metrics,bro,moloch,suricata,janitor,mumble,endgame --extra-vars "run_option=install"

kibana-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t kibana,metrics,bro,moloch,suricata,janitor,mumble,endgame "run_option=install"

metrics-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t metrics,bro,moloch,suricata,janitor,mumble,endgame

bro-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t bro,moloch,suricata,janitor,mumble,endgame --extra-vars "run_option=install"

moloch-rerun:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t moloch,suricata,janitor,mumble,endgame --extra-vars "run_option=install"

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
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -e node_to_add=$(NODE) -t pull_join_script,kube-node,es-scale,bro-scale,suricata-scale,moloch-scale,enable-sensor-monitor-interface
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -t logstash

remove-node:
	ansible-playbook $(REMOVE_PLAYBOOK) -i $(INVENTORY)

change-interfaces:
	ansible-playbook $(PLAYBOOK) -i $(INVENTORY) -e update_kube_vars=true -t change-interfaces,vars-configmap

#Requires FIREWALL_URL and LOGSTASH_PORT to be specified on the command line, e.g.
#make winlogbeat FIREWALL_URL=localhost LOGSTASH_PORT=9200 INSTALL_WLB=TRUE INSTALL_SYSMON=TRUE
winlogbeat:
	ansible-playbook winlogbeat.yml -i $(INVENTORY) -t winlogbeat \
	--extra-vars "firewall_url=$(FIREWALL_URL) logstash_fw_port=$(LOGSTASH_PORT) \
	install_winlogbeat=$(INSTALL_WLB) install_sysmon=$(INSTALL_SYSMON) \
	install_endgame=$(INSTALL_ENDGAME) \
	endgame_server=$(ENDGAME_SERVER) \
	endgame_port=$(ENDGAME_PORT) \
	endgame_user='$(ENDGAME_USER)' \
	endgame_password=$(ENDGAME_PASSWORD) \
	endgame_config_name='$(ENDGAME_CONFIG_NAME)' \
	endgame_vdi=$(ENDGAME_VDI) \
	endgame_dissolvable=$(ENDGAME_DISSOLVABLE) \
	endgame_sensor_id=$(ENDGAME_SENSOR_ID)"
