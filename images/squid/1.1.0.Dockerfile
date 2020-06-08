FROM registry.access.redhat.com/ubi7/ubi

RUN yum -y install squid bind-utils iputils && \
    yum clean all

ENTRYPOINT /usr/sbin/squid -N
