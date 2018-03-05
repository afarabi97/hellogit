# Dockerfile for suricata

FROM dwharve/base:icdm

RUN yum -y update &&\
    yum -y install epel-release &&\
    yum -y install suricata

RUN curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-6.2.2-x86_64.rpm && \
    rpm -i filebeat-6.2.2-x86_64.rpm && \
    rm -f filebeat-6.2.2-x86_64.rpm

RUN yum -y autoremove &&\
    yum clean all &&\
    rm -rf /var/cahce/yum &&\
    find /var/log -type f -delete

COPY filebeat.yml.conf /etc/icdm/conf/
COPY filebeat.yml.tmpl /etc/icdm/templates/
RUN systemctl enable filebeat

COPY suricata.service /usr/lib/systemd/system/suricata.service
COPY suricata.yaml.conf /etc/icdm/conf/
COPY suricata.yaml.tmpl /etc/icdm/templates/
RUN mkdir -p /var/log/suricata
RUN systemctl enable suricata
