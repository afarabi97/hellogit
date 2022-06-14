#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

if [[ -f "/opt/tfplenum/.venv/bin/python" ]]; then
  /opt/tfplenum/.venv/bin/python run.py
else
  python3 "${SCRIPT_DIR}/run.py"
fi
