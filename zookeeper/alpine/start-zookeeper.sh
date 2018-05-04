#!/bin/bash

if [ -v JAVA_OPTS ]; then
export JAVA_OPTS=${JAVA_OPTS}
fi

if [ -v INSTANCE_ID ]; then
ID="$INSTANCE_ID"
cat << EOF > ${ZOOKEEPER_HOME}/conf/zoo.cfg
tickTime=2000
standaloneEnabled=true
dataDir=/data
dataLogDir=/datalog
clientPort=2181
EOF
else
ID=`echo $HOSTNAME | cut -d'-' -f2`
fi

# Get the kafka replicate number
 echo $ID > ${ZOOKEEPER_DATA_DIR}/myid

cat ${ZOOKEEPER_HOME}/conf/zoo.cfg
ls -la ${ZOOKEEPER_HOME}/conf

# Start zookeeper service
${ZOOKEEPER_HOME}/bin/zkServer.sh --config ${ZOOKEEPER_HOME}/conf start-foreground
