FROM registry.access.redhat.com/ubi7/ubi

COPY squid.conf /etc/squid/squid.conf

RUN yum -y install squid && \
    yum clean all

ENTRYPOINT /usr/sbin/squid -N
