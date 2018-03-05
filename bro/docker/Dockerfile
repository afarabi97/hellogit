FROM dwharve/base:icdm

COPY rocknsm-2.1.repo /etc/yum.repos.d/rocknsm-2.1.repo

RUN yum install -y bro bro-plugin-kafka bro-plugin-af_packet

RUN systemctl enable bro

# Add configuration templates
COPY local.bro.conf /etc/icdm/conf/
COPY local.bro.tmpl /etc/icdm/templates/
COPY kafka.bro.conf /etc/icdm/conf/
COPY kafka.bro.tmpl /etc/icdm/templates/
COPY broctl.cfg.conf /etc/icdm/conf/
COPY broctl.cfg.tmpl /etc/icdm/templates/
COPY node.cfg.conf /etc/icdm/conf/
COPY node.cfg.tmpl /etc/icdm/templates/
COPY networks.cfg.conf /etc/icdm/conf/
COPY networks.cfg.tmpl /etc/icdm/templates/
COPY bro.service /usr/lib/systemd/system
RUN mkdir -p /usr/share/bro/site/scripts/plugins

RUN yum autoremove -y && yum clean all && rm -rf /var/cache/yum/*
