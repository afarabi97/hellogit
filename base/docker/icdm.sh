#!/bin/bash

parse_templates () {
  for conffile in $(find /etc/icdm -type l -name "*.conf"); do
    src=$(cat $conffile | grep -P '^src:\s+' | head -n 1 | awk '{ $1=""; print $0}')
    dst=$(cat $conffile | grep -P '^dst:\s+' | head -n 1 | awk '{ $1=""; print $0}')
    uid=$(cat $conffile | grep -P '^uid:\s+' | head -n 1 | awk '{ $1=""; print $0}')
    gid=$(cat $conffile | grep -P '^gid:\s+' | head -n 1 | awk '{ $1=""; print $0}')
    mode=$(cat $conffile | grep -P '^mode:\s+' | head -n 1 | awk '{ $1=""; print $0}')
    reload_cmd=$(cat $conffile | grep -P '^reload_cmd:\s+' | head -n 1 | awk '{ $1=""; print $0}')
    if [ ! -f $src ]; then continue; fi;
    tmpfile=/tmp/$(basename $src).tmp
    echo "cat <<END_OF_TEXT_FILE" > $tmpfile
    cat $src >> $tmpfile
    echo " " >> $tmpfile
    echo "END_OF_TEXT_FILE" >> $tmpfile
    bash $tmpfile > $tmpfile.expanded
    if jinja2 --format=yml $tmpfile.expanded /etc/icdm/vars.yml 2> $tmpfile.err > $tmpfile; then
      cp $tmpfile $dst
      chown $uid:$gid $dst
      chmod $mode $dst
      bash -c "$reload_cmd"
    fi
    if [ -f $tmpfile.err ]; then cat $tmpfile.err; fi
    rm -f $tmpfile*
  done;
}

parse_templates

while /bin/inotifywait -r -e modify,create,delete /etc/icdm;
do
  parse_templates
done;
