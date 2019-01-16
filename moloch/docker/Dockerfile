FROM centos/systemd as builder

RUN yum -y update
RUN yum -y install epel-release
RUN yum -y install expect libpng gcc-c++ bzip2 nodejs
RUN yum -y install https://files.molo.ch/builds/centos-7/moloch-nightly.x86_64.rpm

RUN mv /data/moloch-nightly /data/moloch

RUN cd /data/moloch/viewer && \
    npm install fs-ext && \
    sed -i 's/include views/include \/data\/moloch\/viewer\/views/g' /data/moloch/viewer/viewer.js && \
    sed -i "s/'.\/vueapp/__dirname + '\/vueapp/" /data/moloch/viewer/viewer.js && \
    mkdir -p /data/moloch/raw

RUN curl -L -o /tmp/GeoLite2-Country.tar.gz http://geolite.maxmind.com/download/geoip/database/GeoLite2-Country.tar.gz && \
    curl -L -o /tmp/GeoLite2-ASN.tar.gz http://geolite.maxmind.com/download/geoip/database/GeoLite2-ASN.tar.gz && \
    curl -L -o /data/moloch/etc/ipv4-address-space.csv https://www.iana.org/assignments/ipv4-address-space/ipv4-address-space.csv && \
    curl -L -o /data/moloch/etc/oui.txt https://raw.githubusercontent.com/wireshark/wireshark/master/manuf && \
    tar -ztf /tmp/GeoLite2-Country.tar.gz | grep mmdb | xargs -I X tar -Ozxf /tmp/GeoLite2-Country.tar.gz X >> /data/moloch/etc/GeoLite2-Country.mmdb && \
    tar -ztf /tmp/GeoLite2-ASN.tar.gz | grep mmdb | xargs -I X tar -Ozxf /tmp/GeoLite2-ASN.tar.gz X >> /data/moloch/etc/GeoLite2-ASN.mmdb

# temp till we stop using nightly
COPY moloch_add_user.sh /data/moloch/bin/
RUN chmod 777 /data/moloch/bin/moloch_add_user.sh

FROM centos/systemd

RUN mkdir -p /data/moloch && \
    yum -y install expect libpng bzip2 nodejs && \
    yum clean all && \
    rm -rf /var/cache/yum

COPY --from=builder /data/moloch/ /data/moloch/
COPY molochcapture.service /usr/lib/systemd/system/
COPY molochviewer.service /usr/lib/systemd/system/

RUN systemctl enable molochcapture molochviewer

EXPOSE 8005

# Start systemd
CMD ["/usr/sbin/init"]
