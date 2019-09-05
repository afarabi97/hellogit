FROM centos:7

COPY run_moloch.sh /data/moloch/bin/
COPY moloch_add_user.sh /data/moloch/bin/

RUN yum install -y epel-release && yum install -y https://files.molo.ch/builds/centos-7/moloch-2.0.0-1.x86_64.rpm && yum clean all && \
    curl -L -o /tmp/GeoLite2-Country.tar.gz http://geolite.maxmind.com/download/geoip/database/GeoLite2-Country.tar.gz && \
    curl -L -o /tmp/GeoLite2-ASN.tar.gz http://geolite.maxmind.com/download/geoip/database/GeoLite2-ASN.tar.gz && \
    curl -L -o /data/moloch/etc/ipv4-address-space.csv https://www.iana.org/assignments/ipv4-address-space/ipv4-address-space.csv && \
    curl -L -o /data/moloch/etc/oui.txt https://raw.githubusercontent.com/wireshark/wireshark/master/manuf && \
    tar -ztf /tmp/GeoLite2-Country.tar.gz | grep mmdb | xargs -I X tar -Ozxf /tmp/GeoLite2-Country.tar.gz X >> /data/moloch/etc/GeoLite2-Country.mmdb && \
    tar -ztf /tmp/GeoLite2-ASN.tar.gz | grep mmdb | xargs -I X tar -Ozxf /tmp/GeoLite2-ASN.tar.gz X >> /data/moloch/etc/GeoLite2-ASN.mmdb && \
    chmod 755 /data/moloch/bin/run_moloch.sh && \
    mkdir -p /data/moloch/raw /data/moloch/logs

EXPOSE 8005

CMD ["/data/moloch/bin/run_moloch.sh"]
