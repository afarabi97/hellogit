# Build Bro
FROM centos:7 as builder

ENV VER 2.6.2
ENV WD /scratch

WORKDIR /scratch

RUN yum install -y epel-release
RUN yum update -y
RUN yum install -y wget kernel-devel git cmake make gcc gcc-c++ flex bison libpcap-devel openssl-devel python-devel swig zlib-devel librdkafka-devel
RUN git clone --depth 1 https://github.com/J-Gras/bro-af_packet-plugin.git
RUN git clone --depth 1 https://github.com/corelight/bro-community-id.git
RUN git clone --depth 1 https://github.com/apache/metron-bro-plugin-kafka.git
ADD ./common/buildbro.sh ${WD}/common/buildbro.sh
RUN chmod +x ${WD}/common/buildbro.sh && ${WD}/common/buildbro.sh ${VER} http://www.zeek.org/downloads/bro-${VER}.tar.gz
RUN cd ${WD}/bro-af_packet-plugin && ./configure --bro-dist=/usr/src/bro-${VER} --with-latest-kernel && make install
RUN cd ${WD}/bro-community-id && ./configure --bro-dist=/usr/src/bro-${VER} && make install
RUN cd ${WD}/metron-bro-plugin-kafka && ./configure --bro-dist=/usr/src/bro-${VER} && make install


# Get geoip data
FROM centos:7 as geogetter
RUN yum update -y && yum install -y install wget ca-certificates
ADD ./common/getmmdb.sh /usr/local/bin/getmmdb.sh
RUN chmod +x /usr/local/bin/getmmdb.sh && /usr/local/bin/getmmdb.sh


# Get RPMs
FROM centos:7 as rpms

WORKDIR /rpms

RUN yum install -y epel-release && yum install --downloadonly --downloaddir=. libmaxminddb libmaxminddb-devel openssl librdkafka-devel

# Build the final image
FROM registry.access.redhat.com/ubi8-minimal
ENV VER 2.6.2

WORKDIR /data

#install runtime dependencies
COPY --from=rpms /rpms /tmp/rpms
RUN microdnf install libpcap && microdnf clean all && \
  rpm -ivh --force /tmp/rpms/* && rm -rf /tmp/rpms

COPY --from=builder /usr/local/bro-${VER} /usr/local/bro-${VER}
COPY --from=geogetter /usr/share/GeoIP/* /usr/share/GeoIP/
RUN ln -s /usr/local/bro-${VER} /bro && \
    mkdir -p /usr/share/bro/site/scripts/plugins

ENTRYPOINT ["/bro/bin/bro"]
CMD ["-h"]
