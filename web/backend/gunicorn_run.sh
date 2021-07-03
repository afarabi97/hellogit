#!/bin/bash

if [ "$1" == "debug" ]
then
    /opt/tfplenum/core/tfp-env/bin/gunicorn --reload --config /opt/tfplenum/web/setup/gunicorn_config_debug.py app:app
else
    /opt/tfplenum/core/tfp-env/bin/gunicorn --reload --config /opt/tfplenum/web/setup/gunicorn_config.py app:app
fi

