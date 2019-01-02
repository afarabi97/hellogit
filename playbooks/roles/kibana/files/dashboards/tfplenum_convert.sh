#!/usr/bin/env bash

# Takes Security Onion dashboards and converts them to tfplenum conventions

cd "$(dirname "$0")" # Change CWD to script location

/usr/bin/sed -i \
  -e 's/event_type:snort/event_type:suricata/g' \
  -e 's/\*:logstash\-\*/logstash-*/g' \
  *.json

nav=$(/usr/bin/jq -c . tfplenum_nav.txt)

/usr/bin/find . -name '*.json' | while read -r f ;  do
  /usr/bin/cat $f |
  #/usr/bin/jq 'del(.objects[] | select(.type=="index-pattern"))' | # We are using a different version of ES which doesn't support saved index patterns... and we are loading it somewhere else anyways
  /usr/bin/jq --arg nav "$nav" '(.objects[] | .attributes | select(.title=="Navigation") | .visState) |= $nav' |
  /usr/bin/sponge "$f" ;
done