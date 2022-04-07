#!/bin/bash

pushd web/backend > /dev/null
# runs python pylint checking
exec pylint --exit-zero --ignore=tests --rcfile=../../pylint.rc\
  *.py **/*.py\
  --msg-template="'{path}:{line}: [{msg_id}({symbol}), {obj}] {msg}'" > pylint-backend.txt
popd > /dev/null
