#!/bin/bash

parse_templates () {
  for conffile in $(find /etc/icdm -type l -name "*.conf"); do
    src=$(cat $conffile | grep -P '^src:\s+' | head -n 1 | awk '{ $1=""; print $0}')
    dst=$(cat $conffile | grep -P '^dst:\s+' | head -n 1 | awk '{ $1=""; print $0}')
    uid=$(cat $conffile | grep -P '^uid:\s+' | head -n 1 | awk '{ $1=""; print $0}')
    gid=$(cat $conffile | grep -P '^gid:\s+' | head -n 1 | awk '{ $1=""; print $0}')
    mode=$(cat $conffile | grep -P '^mode:\s+' | head -n 1 | awk '{ $1=""; print $0}')
    reload_cmd=$(cat $conffile | grep -P '^reload_cmd:\s+' | head -n 1 | awk '{ $1=""; print $0}')    
    # Remove trailing \r
    src=`echo $src | sed 's/\\r//g'`
    dst=`echo $dst | sed 's/\\r//g'`
    uid=`echo $uid | sed 's/\\r//g'`
    gid=`echo $gid | sed 's/\\r//g'`
    mode=`echo $mode | sed 's/\\r//g'`
    reload_cmd=`echo $reload_cmd | sed 's/\\r//g'`
    if jinja2 --format=yml $src /etc/icdm/vars.yml -D host=$HOSTNAME > /tmp/$(basename $src); then
      cp /tmp/$(basename $src) $dst
      chown $uid:$gid $dst
      chmod $mode $dst
      bash -c "$reload_cmd"
      rm /tmp/$(basename $src)
    fi
  done;
}

parse_templates

while /bin/inotifywait -r -e modify,create,delete /etc/icdm;
do
  parse_templates
done;