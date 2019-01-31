# Dockerfile for suricata

FROM centos:7

ARG ELASTIC_VERSION=6.6.0

COPY crontab /etc/crontab
COPY rm-suricata-logs.sh /usr/local/bin/rm-suricata-logs.sh
COPY run_suricata.sh /usr/local/bin/run_suricata.sh

RUN yum install -y epel-release && \
    yum update -y && \
    yum install -y suricata https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-${ELASTIC_VERSION}-x86_64.rpm && \
    yum clean all && \
    rm -rf /var/cache/yum && \
    curl -L -O https://rules.emergingthreats.net/open/suricata-4.0/emerging.rules.tar.gz && \
    tar -zxf emerging.rules.tar.gz -C /etc/suricata && \
    rm -f emerging.rules.tar.gz && \
    mkdir -p /var/log/suricata && \
    chmod +x /usr/local/bin/rm-suricata-logs.sh && \
    chmod 0644 /etc/crontab && \
    chmod 755 /usr/local/bin/run_suricata.sh

CMD ["/usr/local/bin/run_suricata.sh"]