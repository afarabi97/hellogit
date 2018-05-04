#!/bin/bash

mirror=$(curl --stderr /dev/null 'https://www.apache.org/dyn/closer.cgi?as_json=1' | grep '.preferred' | awk '{ print $2 }' | sed 's/\"//g')

if [[ -z "$mirror" ]]; then
	echo "Unable to determine mirror for downloading Kafka, the service may be down"
	exit 1
fi

url="${mirror}zookeeper/${ZOOKEEPER_DIST}/${ZOOKEEPER_DIST}.tar.gz"
curl -s -o /tmp/${ZOOKEEPER_DIST}.tar.gz ${url}
