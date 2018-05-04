#!/bin/bash

# Systemd does not inherit environment variables so
# so this grabs them from proc
for e in $(tr "\000" "\n" < /proc/1/environ); do
        eval "export $e"
done

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

# Start zookeeper service
${ZOOKEEPER_HOME}/bin/zkServer.sh --config ${ZOOKEEPER_HOME}/conf start-foreground