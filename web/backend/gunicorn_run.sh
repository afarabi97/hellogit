#!/bin/bash

/opt/tfplenum/web/tfp-env/bin/gunicorn --reload --config /opt/tfplenum/web/setup/gunicorn_config_debug.py app:app
