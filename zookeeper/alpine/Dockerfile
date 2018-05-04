FROM openjdk:8u151-jre-alpine

ARG zookeeper_dist=zookeeper-3.5.3-beta
ARG glibc_version=2.27-r0

ENV ZOOKEEPER_DIST=$zookeeper_dist \    
    ZOOKEEPER_HOME=/opt/zookeeper \
    ZOOKEEPER_DATA_DIR=/data \
    ZOOKEEPER_DATALOG_DIR=/datalog \
    GLIBC_VERSION=$glibc_version

ENV PATH=${PATH}:${ZOOKEEPER_HOME}/bin

COPY start-zookeeper.sh /usr/bin/start-zookeeper
COPY zkOk.sh /usr/bin/zkOk
ADD zookeeper-3.5.3-beta.tar.gz /opt/

RUN apk add --no-cache bash curl jq && \  
  chmod +x /usr/bin/start-zookeeper /usr/bin/zkOk && \ 
  chown -R root:root /opt/$zookeeper_dist && \
  sync && \
  ln -s /opt/$zookeeper_dist ${ZOOKEEPER_HOME} && \
  mkdir ${ZOOKEEPER_DATA_DIR} && \
  mkdir ${ZOOKEEPER_DATALOG_DIR} && \ 
  wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/${GLIBC_VERSION}/glibc-${GLIBC_VERSION}.apk && \
  apk add --no-cache --allow-untrusted glibc-${GLIBC_VERSION}.apk && \
  rm glibc-${GLIBC_VERSION}.apk

VOLUME ["/data","/datalog"]

# Use "exec" form so that it runs as PID 1 (useful for graceful shutdown)
CMD ["start-zookeeper"]