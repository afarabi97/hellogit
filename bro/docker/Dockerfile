FROM prodian0013/tfplenum-base:latest

COPY rocknsm-2.1.repo /etc/yum.repos.d/rocknsm-2.1.repo

RUN yum install -y bro bro-plugin-kafka bro-plugin-af_packet && \
    systemctl enable bro && \
    mkdir -p /usr/share/bro/site/scripts/plugins

# Add configuration templates
COPY ["local.bro.conf","kafka.bro.conf","broctl.cfg.conf","node.cfg.conf","networks.cfg.conf","/etc/icdm/conf/"]
COPY ["local.bro.tmpl","kafka.bro.tmpl","broctl.cfg.tmpl", "node.cfg.tmpl","networks.cfg.tmpl","/etc/icdm/templates/"]

COPY bro.service /usr/lib/systemd/system