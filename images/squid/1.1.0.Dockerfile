FROM registry.access.redhat.com/ubi7/ubi

COPY squid.conf /etc/squid/squid.conf

RUN yum -y install squid bind-utils iputils && \
    yum clean all

ENTRYPOINT /usr/sbin/squid -N
