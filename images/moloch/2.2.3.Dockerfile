FROM centos:7

ARG maxmind_api_key
ENV api_key=${maxmind_api_key}
COPY run_moloch.sh /data/moloch/bin/

RUN yum install -y epel-release && yum install -y https://files.molo.ch/builds/centos-7/moloch-2.2.3-1.x86_64.rpm && yum clean all && \
    curl -L -o /tmp/GeoLite2-Country.tar.gz "https://download.maxmind.com/app/geoip_download?license_key=${api_key}&edition_id=GeoLite2-Country&suffix=tar.gz" && \
    curl -L -o /tmp/GeoLite2-ASN.tar.gz "https://download.maxmind.com/app/geoip_download?license_key=${api_key}&edition_id=GeoLite2-ASN&suffix=tar.gz" && \
    curl -L -o /data/moloch/etc/ipv4-address-space.csv "https://www.iana.org/assignments/ipv4-address-space/ipv4-address-space.csv" && \
    curl -L -o /data/moloch/etc/oui.txt "https://raw.githubusercontent.com/wireshark/wireshark/master/manuf" && \
    tar -ztf /tmp/GeoLite2-Country.tar.gz | grep mmdb | xargs -I X tar -Ozxf /tmp/GeoLite2-Country.tar.gz X >> /data/moloch/etc/GeoLite2-Country.mmdb && \
    tar -ztf /tmp/GeoLite2-ASN.tar.gz | grep mmdb | xargs -I X tar -Ozxf /tmp/GeoLite2-ASN.tar.gz X >> /data/moloch/etc/GeoLite2-ASN.mmdb && \
    chmod 755 /data/moloch/bin/run_moloch.sh && \
    mkdir -p /data/moloch/raw /data/moloch/logs && \
    rm -rf /tmp/GeoLite*
EXPOSE 8005
CMD ["/data/moloch/bin/run_moloch.sh"]