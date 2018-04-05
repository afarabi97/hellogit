#!/bin/bash

icdm_dir=/etc/icdm
icdm_vars=/etc/icdm/vars.yml

parse_templates () {
  /usr/bin/python /icdm.py -d $icdm_dir -v $icdm_vars
  ret=$?
  if [ $ret -ne 0 ]; then
    exit 1
  fi  
}

parse_templates

while /bin/inotifywait -r -e modify,create,delete $icdm_dir;
do
  parse_templates
done;