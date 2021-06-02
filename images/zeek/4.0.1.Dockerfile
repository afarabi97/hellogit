# Create builder stage
FROM centos:8 as builder

ARG ZEEK_VERSION=4.0.1

ENV WD /scratch
WORKDIR /scratch

# Install Required dev toolset
RUN yum update -y && yum clean all
RUN yum -y install epel-release wget dnf-plugins-core
RUN yum config-manager --set-enabled powertools

# Update repos and install required packages
RUN curl -L -o /etc/yum.repos.d/zeek.repo https://download.opensuse.org/repositories/security:zeek/CentOS_8/security:zeek.repo
RUN cat /etc/yum.repos.d/zeek.repo
RUN yum install -y python3-pip
RUN yum install -y libpcap-devel zeek-devel-${ZEEK_VERSION} zeek-${ZEEK_VERSION} git cmake3 cmake make gcc gcc-c++ librdkafka-devel kernel-devel kernel-headers

# Build zkg with pip from source
RUN pip3 install virtualenv
RUN virtualenv --python=python3 /root/zeek-env
RUN /root/zeek-env/bin/pip3 install --upgrade pip
RUN /root/zeek-env/bin/pip3 install configparser
RUN /root/zeek-env/bin/pip3 install git+git://github.com/zeek/package-manager@master

# Prepare zkg
ENV PATH="/root/zeek-env/bin:/opt/zeek/bin:${PATH}"
RUN zkg autoconfig
RUN zkg refresh

# Install plugins with zkg
# AF_PACKET
RUN zkg install --skiptest --force corelight/zeek-community-id

## NOTE: REPLACE WITH ZKG
# Download plugins
RUN rm -rf /root/.zkg/clones/source/zeek
RUN git clone https://github.com/briansypher/zeek-af_packet-plugin.git /opt/zeek-af_packet-plugin && \
    zkg install --skiptest --force /opt/zeek-af_packet-plugin

#RUN cd ${WD} && git clone https://github.com/briansypher/zeek-af_packet-plugin.git && \
#    cd zeek-af_packet-plugin && zkg install --force .

# Clean up zkg directory
RUN rm -rf /root/.zkg/testing/* /root/.zkg/scratch/*

# Create geogetter stage
FROM centos:8 as geogetter
WORKDIR /usr/share/GeoIP
RUN yum update -y

# Download databases
RUN curl -L -o GeoLite2-City.tar.gz \
  "http://misc.labrepo.sil.lab/GeoLite2-City.tar.gz"
RUN tar -ztf /usr/share/GeoIP/GeoLite2-City.tar.gz | grep mmdb | xargs -I X tar -Ozxf /usr/share/GeoIP/GeoLite2-City.tar.gz X >> /usr/share/GeoIP/GeoLite2-City.mmdb
RUN curl -L -o GeoLite2-ASN.tar.gz \
  "http://misc.labrepo.sil.lab/GeoLite2-ASN.tar.gz"
RUN tar -ztf /usr/share/GeoIP/GeoLite2-ASN.tar.gz | grep mmdb | xargs -I X tar -Ozxf /usr/share/GeoIP/GeoLite2-ASN.tar.gz X >> /usr/share/GeoIP/GeoLite2-ASN.mmdb

# Create rpms stage
FROM centos:8 as rpms

WORKDIR /rpms
RUN yum install -y epel-release dnf-plugins-core
RUN yum config-manager --set-enabled powertools
RUN dnf download --installroot=/tmp/ --releasever=/ --destdir=. --archlist=x86_64 make openssl-libs pkgconf pkgconfig libmaxminddb libmaxminddb-devel openssl librdkafka librdkafka-devel libpcap libpcap-devel

# Build the final image
FROM registry.access.redhat.com/ubi8-minimal
WORKDIR /data

# Copy from previous stages
COPY --from=rpms /rpms /tmp/rpms
COPY --from=builder /usr/bin/git /usr/bin/git
COPY --from=builder /root/.local /root/.local
COPY --from=builder /root/.zkg /root/.zkg
COPY --from=builder /root/zeek-env /root/zeek-env
COPY --from=geogetter /usr/share/GeoIP/* /usr/share/GeoIP/
COPY --from=builder /opt/zeek /opt/zeek

# Install dependencies
RUN microdnf install python3 git libpkgconf pkgconf-m4 vi iproute libpcap && microdnf clean all && \
  rpm -ivh --force /tmp/rpms/*.x86_64.rpm && rm -rf /tmp/rpms && \
  mkdir -p /opt/zeek/site/scripts/plugins

WORKDIR /opt/zeek

# Set PATH
ENV PATH="/root/zeek-env/bin:/opt/zeek/bin:${PATH}"

ENTRYPOINT ["/opt/zeek/bin/zeek"]
CMD ["-h"]
