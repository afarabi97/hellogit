# Dockerfile for moloch

FROM tfplenum/base:latest
RUN yum -y install expect nodejs libpng libpng-devel gcc-c++ && \
  yum clean all
RUN yum -y install https://files.molo.ch/builds/centos-7/moloch-1.1.1-1.x86_64.rpm && \
  yum clean all

RUN cd /data/moloch/viewer && \
    npm install fs-ext@0.5.0 png

RUN sed -i 's/include views/include \/data\/moloch\/viewer\/views/g' /data/moloch/viewer/viewer.js

RUN yum -y autoremove gcc-c++ libpng-devel && \
    yum -y autoremove && \
    yum clean all

COPY molochviewer.service /usr/lib/systemd/system/
RUN systemctl enable molochviewer

COPY config.ini.conf /etc/icdm/conf/
COPY config.ini.tmpl /etc/icdm/templates/

# Fix for error in beta 3
RUN sed -i "s/'.\/vueapp/__dirname + '\/vueapp/" /data/moloch/viewer/viewer.js

EXPOSE 8005