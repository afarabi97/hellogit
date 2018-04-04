#!/bin/bash

icdm_dir=/etc/icdm
icdm_vars=/etc/icdm/vars.yml

parse_templates () {
  $reload_cmd=$(/usr/bin/python /icdm.py -d $icdm_dir -v $icdm_vars)
  ret=$?
  if [ $ret -ne 0 ]; then
    exit 1
  fi
  bash -c "$reload_cmd"
}

parse_templates

while /bin/inotifywait -r -e modify,create,delete $icdm_dir;
do
  parse_templates
done;