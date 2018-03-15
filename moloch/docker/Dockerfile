# Dockerfile for moloch

FROM prodian0013/tfplenum-base:latest

RUN curl -L -o /tmp/moloch.rpm https://files.molo.ch/builds.1/centos-7/moloch-1.0.0_beta2-1.x86_64.rpm && \
    yum -y install expect nodejs libyaml perl perl-libwww-perl perl-JSON libpng /tmp/moloch.rpm && \
    yum clean all && \
    rm -rf /var/cache/yum && \
    rm -f /tmp/moloch.rpm && \
    curl -L -o /tmp/GeoLite2-Country.tar.gz http://geolite.maxmind.com/download/geoip/database/GeoLite2-Country.tar.gz && \
    curl -L -o /tmp/GeoLite2-ASN.tar.gz http://geolite.maxmind.com/download/geoip/database/GeoLite2-ASN.tar.gz && \
    curl -L -o /data/moloch/etc/ipv4-address-space.csv https://www.iana.org/assignments/ipv4-address-space/ipv4-address-space.csv && \
    curl -L -o /data/moloch/etc/oui.txt https://raw.githubusercontent.com/wireshark/wireshark/master/manuf && \
    tar -ztf /tmp/GeoLite2-Country.tar.gz | grep mmdb | xargs -I X tar -Ozxf /tmp/GeoLite2-Country.tar.gz X >> /data/moloch/etc/GeoLite2-Country.mmdb && \
    tar -ztf /tmp/GeoLite2-ASN.tar.gz | grep mmdb | xargs -I X tar -Ozxf /tmp/GeoLite2-ASN.tar.gz X >> /data/moloch/etc/GeoLite2-ASN.mmdb && \
    rm -rf /tmp/GeoLite2-*

COPY molochcapture.service /usr/lib/systemd/system/
COPY molochviewer.service /usr/lib/systemd/system/
RUN systemctl enable molochcapture molochviewer

COPY config.ini.conf /etc/icdm/conf/
COPY config.ini.tmpl /etc/icdm/templates/

EXPOSE 8005
