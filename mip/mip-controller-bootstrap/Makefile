BOOTSTRAP_PLAYBOOK ?= 'site.yml'

bootstrap:
	ansible-playbook $(BOOTSTRAP_PLAYBOOK) --connection=local -i localhost, -t bootstrap,clonerepo,cleanup


