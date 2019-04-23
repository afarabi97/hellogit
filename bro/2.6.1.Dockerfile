
# This build uses multi-stage docker builds. This requires Docker 17.05 or higher.
# For more information see https://docs.docker.com/develop/develop-images/multistage-build/#use-multi-stage-builds
# This lets you do is build a docker container with all your dependencies.
# In this case, the builder has all the extra bloat that comes with making bro from
# source, but when the final image is built it only has what is required.
# You can test the container with: docker run --privileged --name bro -v /sys/fs/cgroup:/sys/fs/cgroup:ro tfplenum/bro:2.6.1

# Build Bro

FROM centos:7 as builder

ENV VER 2.6.1
ENV WD /scratch

WORKDIR /scratch

RUN yum update -y
RUN yum install -y epel-release
RUN yum install -y wget librdkafka-devel kernel-devel git cmake make gcc gcc-c++ flex bison libpcap-devel openssl-devel python-devel swig zlib-devel
RUN git clone https://github.com/J-Gras/bro-af_packet-plugin.git
ADD ./common/buildbro ${WD}/common/buildbro
RUN chmod +x ${WD}/common/buildbro && ${WD}/common/buildbro ${VER} http://www.zeek.org/downloads/bro-${VER}.tar.gz
RUN ls -al /usr/src/kernels/ && cd ${WD}/bro-af_packet-plugin && ./configure --bro-dist=/usr/src/bro-${VER} --with-latest-kernel && make && make install

# Get geoip data

FROM centos:7 as geogetter
RUN yum update -y && yum install -y install wget ca-certificates
ADD ./common/getmmdb.sh /usr/local/bin/getmmdb.sh
RUN chmod +x /usr/local/bin/getmmdb.sh && /usr/local/bin/getmmdb.sh

# Build the final image

FROM centos/systemd
ENV VER 2.6.1

ARG ELASTIC_VERSION=6.5.3

#install runtime dependencies
RUN yum -y install epel-release \
    && yum update -y \
    && yum -y install libpcap openssl-devel libmaxminddb-devel libmaxminddb python2 python-pip iproute cronie \
                      https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-${ELASTIC_VERSION}-x86_64.rpm \
    && yum clean all && rm -rf /var/cache/yum \
    && pip install ipaddress && rm -rf ~/.cache/pip

COPY --from=builder /usr/local/bro-${VER} /usr/local/bro-${VER}
COPY --from=geogetter /usr/share/GeoIP/* /usr/share/GeoIP/
COPY crontab /etc/crontab
COPY bro.service /etc/systemd/system
RUN chmod 0644 /etc/crontab && \
    ln -s /usr/local/bro-${VER} /bro && \
    systemctl enable bro filebeat crond && \
    mkdir -p /usr/share/bro/site/scripts/plugins

# Start systemd
CMD ["/usr/sbin/init"]
