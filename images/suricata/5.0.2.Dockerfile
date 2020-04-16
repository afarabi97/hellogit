# Build Suricata
FROM centos:7 as builder

ENV VER 5.0.2
ENV URL https://www.openinfosecfoundation.org/download/suricata-${VER}.tar.gz

WORKDIR /scratch

RUN yum install -y epel-release && \
    yum update -y && \
    yum install -y autoconf automake cargo file-devel gcc gcc gcc-c++ \
        GeoIP-devel hiredis-devel jansson-devel jq libcap-ng-devel \
        libevent-devel libnet-devel libnetfilter_queue-devel libpcap-devel \
        libprelude-devel libtool libtool-ltdl-devel libyaml-devel lua-devel \
        luajit-devel lz4-devel make nss-devel openssl-devel pcre-devel \
        zlib-devel libmaxminddb-devel && \
    yum clean all && \
    curl -L ${URL} | tar xvzf - && \
    cd suricata-${VER} && \
    ./configure --disable-gccmarch-native \
                --enable-rust \
                --enable-libmagic \
                --enable-luajit \
                --enable-geoip \
                --enable-nfqueue \
                --enable-hiredis \
                --enable-libnss \
                --enable-libnspr \
                --disable-suricata-update \
                --prefix=/usr/local/suricata-${VER} \
                --sysconfdir=/etc \
                --localstatedir=/var && \
    make install && \
    make install-conf && \
    strip -s /usr/local/suricata-${VER}/bin/suricata


# Build the final image
FROM registry.access.redhat.com/ubi8-minimal

ENV VER 5.0.2 

COPY --from=builder /usr/local/suricata-${VER} /usr/local/suricata-${VER}
COPY --from=builder /etc/suricata /etc/suricata
COPY --from=builder /usr/share/misc/magic /usr/share/misc/magic
COPY --from=builder \
    /usr/lib64/libevent-2.0.so.5 \
    /usr/lib64/libevent_pthreads-2.0.so.5 \
    /usr/lib64/libGeoIP.so.1 \
    /usr/lib64/libhiredis.so.0.12 \
    /usr/lib64/libjansson.so.4 \
    /usr/lib64/libluajit-5.1.so.2 \
    /usr/lib64/libmagic.so.1 \
    /usr/lib64/libmnl.so.0 \
    /usr/lib64/libnet.so.1 \
    /usr/lib64/libnetfilter_queue.so.1 \
    /usr/lib64/libnfnetlink.so.0 \
    /usr/lib64/libmaxminddb.so.0 \
    /usr/lib64/

RUN microdnf install python2 libpcap nss && \
    microdnf clean all && \
    ln -s /usr/local/suricata-${VER} /suricata && \
    mkdir -p /var/log/suricata /etc/suricata/lua-output/ /etc/suricata/rules/

COPY suricata.yaml /etc/suricata/suricata.yaml
COPY script1.lua /etc/suricata/lua-output/script1.lua

ENTRYPOINT ["/suricata/bin/suricata"]
