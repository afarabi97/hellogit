FROM centos/systemd

ENV container docker
STOPSIGNAL SIGRTMIN+3

RUN yum -y install epel-release && yum -y update

COPY icdm.sh /usr/bin/icdm
COPY icdm.service /usr/lib/systemd/system
RUN yum -y install inotify-tools python2-pip && \
    pip install --upgrade pip && pip install jinja2-cli[yaml] && \
    mkdir -p /etc/icdm/{templates,conf} && touch /etc/icdm/vars.yml && \
    chmod +x /usr/bin/icdm && systemctl enable icdm

RUN yum -y autoremove && \
    rm -rf /var/cache/yum/* && \
    systemctl mask sys-fs-fuse-connections.mount

CMD ["/usr/sbin/init"]
