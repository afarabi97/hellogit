#!/bin/bash
pushd /opt/tfplenum/web/backend > /dev/null
exec ../../.venv/bin/nose2 -v --with-coverage
# exec ../../.venv/bin/nose2 -v
popd > /dev/null
