# Dockerfile for moloch

FROM tfplenum/base:latest
RUN yum -y install expect nodejs libpng gcc-c++ bzip2
RUN yum -y install https://files.molo.ch/builds/centos-7/moloch-1.5.2-1.x86_64.rpm

RUN cd /data/moloch/viewer && \
    npm install fs-ext

RUN sed -i 's/include views/include \/data\/moloch\/viewer\/views/g' /data/moloch/viewer/viewer.js

RUN yum -y autoremove gcc-c++ && \
    yum -y autoremove && \
    yum clean all && \
    rm -rf /var/cache/yum

COPY molochviewer.service /usr/lib/systemd/system/
RUN systemctl enable molochviewer

COPY config.ini.conf /etc/icdm/conf/
COPY config.ini.tmpl /etc/icdm/templates/

# Fix for error in beta 3
RUN sed -i "s/'.\/vueapp/__dirname + '\/vueapp/" /data/moloch/viewer/viewer.js

EXPOSE 8005
