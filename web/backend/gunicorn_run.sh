#!/bin/bash

if [ "$1" == "debug" ]
then
    gunicorn --reload --config /opt/tfplenum/web/setup/gunicorn_config_debug.py wsgi:app
else
    gunicorn --reload --config /opt/tfplenum/web/setup/gunicorn_config.py wsgi:app
fi

