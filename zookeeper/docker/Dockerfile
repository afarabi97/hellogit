FROM tfplenum/base:latest

ARG zookeeper_dist=zookeeper-3.5.3-beta

ENV ZOOKEEPER_DIST=$zookeeper_dist \    
    ZOOKEEPER_HOME=/opt/zookeeper \
    ZOOKEEPER_DATA_DIR=/data \
    ZOOKEEPER_DATALOG_DIR=/datalog \
    JAVA_HOME=/usr/lib/jvm/jre-1.8.0-openjdk
 
ENV PATH=${PATH}:${ZOOKEEPER_HOME}/bin

COPY download-zookeeper.sh /tmp/
COPY zookeeper.service /usr/lib/systemd/system/

RUN yum update -y && \
  yum install java-1.8.0-openjdk-headless -y && \
  chmod +x /tmp/download-zookeeper.sh && \
  /tmp/download-zookeeper.sh && \
  tar xf /tmp/$zookeeper_dist.tar.gz -C /opt && \
  rm /tmp/$zookeeper_dist.tar.gz && \
  ln -s /opt/$zookeeper_dist /opt/zookeeper && \
  mkdir {${ZOOKEEPER_DATA_DIR},${ZOOKEEPER_DATALOG_DIR}} && \
  rm /tmp/download-zookeeper.sh && \
  systemctl enable zookeeper.service && \
  rm --recursive --force /opt/$zookeeper_dist/CHANGES.txt \
    /opt/$zookeeper_dist/README.txt \
    /opt/$zookeeper_dist/NOTICE.txt \
    /opt/$zookeeper_dist/CHANGES.txt \
    /opt/$zookeeper_dist/README_packaging.txt \
    /opt/$zookeeper_dist/build.xml \
    /opt/$zookeeper_dist/config \
    /opt/$zookeeper_dist/contrib \
    /opt/$zookeeper_dist/dist-maven \
    /opt/$zookeeper_dist/docs \
    /opt/$zookeeper_dist/ivy.xml \
    /opt/$zookeeper_dist/ivysettings.xml \
    /opt/$zookeeper_dist/recipes \
    /opt/$zookeeper_dist/src \
    /opt/$zookeeper_dist/$zookeeper_dist.jar.asc \
    /opt/$zookeeper_dist/$zookeeper_dist.jar.md5 \
    /opt/$zookeeper_dist/$zookeeper_dist.jar.sha1 && \
  yum clean all

COPY zoo.cfg ${ZOOKEEPER_HOME}/conf/zoo.cfg
COPY start-zookeeper.sh /

# Expose data dirs
EXPOSE 2181
EXPOSE 2888
EXPOSE 3888