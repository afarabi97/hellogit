FROM centos:8

ARG MOLOCH_VERSION=2.4.1

COPY ${MOLOCH_VERSION}.run_moloch.sh /data/moloch/bin/run_moloch.sh

RUN dnf install -y 'dnf-command(config-manager)' && dnf config-manager --set-enabled PowerTools && \ 
    dnf install -y epel-release && dnf install -y https://s3.amazonaws.com/files.molo.ch/builds/centos-8/moloch-2.4.1-1.x86_64.rpm && dnf clean all && \
    curl -o /tmp/GeoLite2-Country.tar.gz "http://misc.labrepo.sil.lab/GeoLite2-Country.tar.gz" && \
    curl -o /tmp/GeoLite2-ASN.tar.gz "http://misc.labrepo.sil.lab/GeoLite2-ASN.tar.gz" && \
    curl -L -o /data/moloch/etc/ipv4-address-space.csv "https://www.iana.org/assignments/ipv4-address-space/ipv4-address-space.csv" && \
    curl -L -o /data/moloch/etc/oui.txt "https://raw.githubusercontent.com/wireshark/wireshark/master/manuf" && \
    tar -ztf /tmp/GeoLite2-Country.tar.gz | grep mmdb | xargs -I X tar -Ozxf /tmp/GeoLite2-Country.tar.gz X >> /data/moloch/etc/GeoLite2-Country.mmdb && \
    tar -ztf /tmp/GeoLite2-ASN.tar.gz | grep mmdb | xargs -I X tar -Ozxf /tmp/GeoLite2-ASN.tar.gz X >> /data/moloch/etc/GeoLite2-ASN.mmdb && \
    chmod 755 /data/moloch/bin/run_moloch.sh && \
    mkdir -p /data/moloch/raw /data/moloch/logs && \
    rm -rf /tmp/GeoLite*
EXPOSE 8005
CMD ["/data/moloch/bin/run_moloch.sh"]