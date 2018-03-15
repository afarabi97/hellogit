FROM centos/systemd

ENV container docker
STOPSIGNAL SIGRTMIN+3

COPY icdm.py /
COPY icdm.sh /usr/bin/icdm
COPY icdm.service /usr/lib/systemd/system

RUN yum -y install epel-release && \
    yum -y update && \
    yum -y install inotify-tools python2-pip autoremove && \
    pip install --upgrade pip && pip install -U jinja2 pyyaml && \
    mkdir -p /etc/icdm/{templates,conf} && touch /etc/icdm/vars.yml && \
    chmod +x /usr/bin/icdm && \
    chmod +x /icdm.py && \
    systemctl enable icdm && \
    yum clean all && \
    rm -rf /var/cache/yum/* && \
    systemctl mask sys-fs-fuse-connections.mount    

CMD ["/usr/sbin/init"]