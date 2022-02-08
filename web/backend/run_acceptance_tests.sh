#!/bin/bash
# Usage: run_acceptance_tests
pushd web/backend > /dev/null
if [[ $1 == "coverage" ]]
then
    coverage="-p pytest_cov --cov=app"
fi
exec python3 -m pytest --durations=1 --durations-min=600.0 --junitxml=test_results.xml --gherkin-terminal-reporter -W ignore::DeprecationWarning $coverage tests/acceptance/
popd > /dev/null
