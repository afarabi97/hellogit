# Dockerfile for moloch

FROM centos/systemd as builder

RUN yum -y update
RUN yum -y install epel-release
RUN yum -y install expect libpng gcc-c++ bzip2 nodejs
RUN yum -y install https://files.molo.ch/builds/centos-7/moloch-1.6.2-1.x86_64.rpm
RUN cd /data/moloch/viewer && \
    npm install fs-ext && \
    sed -i 's/include views/include \/data\/moloch\/viewer\/views/g' /data/moloch/viewer/viewer.js && \
    sed -i "s/'.\/vueapp/__dirname + '\/vueapp/" /data/moloch/viewer/viewer.js && \
    mkdir -p /data/moloch/raw

FROM centos/systemd

RUN mkdir -p /data/moloch && \
    yum -y install expect libpng bzip2 nodejs && \
    yum clean all && \
    rm -rf /var/cache/yum

COPY --from=builder /data/moloch/ /data/moloch/
COPY molochviewer.service /usr/lib/systemd/system/

RUN systemctl enable molochviewer

EXPOSE 8005

# Start systemd
CMD ["/usr/sbin/init"]