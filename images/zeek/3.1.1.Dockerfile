# Build Bro
FROM centos:7 as builder
ENV VER 3.1.1
ENV WD /scratch

WORKDIR /scratch

RUN yum install -y epel-release 
RUN yum -y install centos-release-scl
RUN yum -y install devtoolset-7-gcc*
SHELL [ "/usr/bin/scl", "enable", "devtoolset-7"]
RUN yum update -y && yum clean all
RUN yum install -y wget kernel-devel git cmake3 cmake make gcc gcc-c++ flex bison libpcap-devel openssl-devel python-devel swig zlib-devel librdkafka-devel
RUN git clone --depth 1 https://github.com/J-Gras/bro-af_packet-plugin.git
# Forked from original to update ./configure options to zeek 3.1.1 
RUN git clone --depth 1 https://github.com/mannydr3/bro-community-id.git
RUN git clone --depth 1 https://github.com/mannydr3/metron-bro-plugin-kafka.git
# Below repos do not work due to broken ./configure options (not updated to zeek 3.1.1)
# RUN git clone --depth 1 https://github.com/corelight/bro-community-id.git
# RUN git clone --depth 1 https://github.com/apache/metron-bro-plugin-kafka.git 
ADD ./common/buildbro.sh ${WD}/common/buildbro.sh
RUN chmod +x ${WD}/common/buildbro.sh && ${WD}/common/buildbro.sh ${VER} https://download.zeek.org/zeek-${VER}.tar.gz
#RUN cd ${WD}/bro-af_packet-plugin && ./configure --bro-dist=/usr/src/zeek-${VER} --with-latest-kernel && make install
# Changed to --zeek-dist
RUN cd ${WD}/bro-af_packet-plugin && ./configure --zeek-dist=/usr/src/zeek-${VER} --with-latest-kernel && make install
# bro-community ./configure still uses --bro-dist as of 3/24/2020
RUN cd ${WD}/bro-community-id && ./configure --bro-dist=/usr/src/zeek-${VER} && make install
RUN cd ${WD}/metron-bro-plugin-kafka && ./configure --bro-dist=/usr/src/zeek-${VER} && make install


# Get geoip data
FROM centos:7 as geogetter
ARG maxmind_api_key
ENV api_key=${maxmind_api_key}

WORKDIR /usr/share/GeoIP
RUN yum update -y

RUN curl -L -o GeoLite2-City.tar.gz \
  "https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-City&license_key=${api_key}&suffix=tar.gz"
RUN tar -ztf /usr/share/GeoIP/GeoLite2-City.tar.gz | grep mmdb | xargs -I X tar -Ozxf /usr/share/GeoIP/GeoLite2-City.tar.gz X >> /usr/share/GeoIP/GeoLite2-City.mmdb
# RUN rm /usr/share/GeoIP/GeoLite2-City.tar.gz
RUN curl -L -o GeoLite2-ASN.tar.gz \
  "https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-ASN&license_key=${api_key}&suffix=tar.gz"
RUN tar -ztf /usr/share/GeoIP/GeoLite2-ASN.tar.gz | grep mmdb | xargs -I X tar -Ozxf /usr/share/GeoIP/GeoLite2-ASN.tar.gz X >> /usr/share/GeoIP/GeoLite2-ASN.mmdb
# RUN rm /usr/share/GeoIP/GeoLite2-ASN.tar.gz


# Get RPMs
FROM centos:7 as rpms

WORKDIR /rpms

RUN yum install -y epel-release && yumdownloader --installroot=/tmp/ --releasever=/ --destdir=. --archlist=x86_64 make openssl-libs pkgconfig libmaxminddb libmaxminddb-devel openssl librdkafka librdkafka-devel

# Build the final image
FROM registry.access.redhat.com/ubi8-minimal
ENV VER 3.1.1

WORKDIR /data

#install runtime dependencies
COPY --from=rpms /rpms /tmp/rpms
RUN microdnf install libpcap && microdnf clean all && \
  rpm -ivh --force /tmp/rpms/*.x86_64.rpm && rm -rf /tmp/rpms

COPY --from=builder /usr/local/zeek-${VER} /usr/local/zeek-${VER}
COPY --from=geogetter /usr/share/GeoIP/* /usr/share/GeoIP/
RUN ln -s /usr/local/zeek-${VER} /zeek && \
    mkdir -p /usr/share/zeek/site/scripts/plugins

ENTRYPOINT ["/zeek/bin/zeek"]
CMD ["-h"]
