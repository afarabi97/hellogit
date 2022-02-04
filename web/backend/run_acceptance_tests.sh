#!/bin/bash
# Usage: run_acceptance_tests
pushd /opt/tfplenum/web/backend > /dev/null
if [[ $1 == "coverage" ]]
then
    coverage="-p pytest_cov --cov=app tests/unit/"
fi
exec pytest -ra -x --pdb --durations-min=10.0 --junitxml=unit_test_results.xml -W ignore::DeprecationWarning $coverage tests/acceptance/
popd > /dev/null
