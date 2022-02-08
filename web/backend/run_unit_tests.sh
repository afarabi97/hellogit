#!/bin/bash
# Usage: there are two aliases for the backend unit tests.
# run_flask_unit_tests and run_flask_unit_tests_with_coverage
pushd web/backend > /dev/null
if [[ $1 == "coverage" ]]
then
    coverage="-p pytest_cov --cov=app tests/unit/"
fi
exec python3 -m pytest -ra -x --pdb --durations-min=10.0 --junitxml=unit_test_results.xml -W ignore::DeprecationWarning $coverage tests/unit/
popd > /dev/null
