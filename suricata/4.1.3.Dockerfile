# Dockerfile for suricata

FROM centos:7

ARG ELASTIC_VERSION=6.6.0
ENV PKGS_TO_INSTALL pcre-devel libpcap-devel zlib-devel file-devel \
                    jansson-devel lua-devel libcap-ng-devel lz4-devel make gcc \
                    libyaml-devel GeoIP-devel hiredis-devel libprelude-devel \
                    libnet-devel gcc-c++ automake autoconf libtool libtool-ltdl-devel \
                    jq openssl-devel gcc nss-devel libnetfilter_queue-devel libevent-devel luajit-devel

COPY crontab /etc/crontab
COPY rm-suricata-logs.sh /usr/local/bin/rm-suricata-logs.sh
COPY 4.1.3.run_suricata.sh /usr/local/bin/run_suricata.sh

RUN yum install -y epel-release && \
    yum update -y && \
    yum install -y crontabs https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-${ELASTIC_VERSION}-x86_64.rpm dos2unix ${PKGS_TO_INSTALL} && \
    yum install -y cargo && \
    yum clean all && \
    curl -L -O https://www.openinfosecfoundation.org/download/suricata-4.1.3.tar.gz && \
    tar xzf suricata-4.1.3.tar.gz && \
    cd suricata-4.1.3/  && \
    ./configure --enable-libmagic --enable-rust --enable-luajit --enable-geoip --enable-nfqueue --enable-hiredis --enable-libnss \
      --enable-libnspr --prefix=/usr --sysconfdir=/etc --localstatedir=/var --libdir=/usr/lib64 && \
    make install && \
    make install-conf && \
    mkdir -p /etc/suricata/lua-output/ /etc/suricata/rules/ && \
    rm -rf /var/cache/yum && \
    mkdir -p /var/log/suricata && \
    dos2unix /etc/crontab && \
    dos2unix /usr/local/bin/rm-suricata-logs.sh && \
    dos2unix /usr/local/bin/run_suricata.sh && \
    chmod +x /usr/local/bin/rm-suricata-logs.sh && \
    chmod 0644 /etc/crontab && \
    chmod 755 /usr/local/bin/run_suricata.sh && \
    yum remove -y ${PKGS_TO_INSTALL} && \
    yum clean all && \
    rm -rf /suricata-4.1.3 /suricata-4.1.3.tar.gz

COPY suricata.yaml /etc/suricata/suricata.yaml
COPY script1.lua /etc/suricata/lua-output/script1.lua

CMD ["/usr/local/bin/run_suricata.sh"]