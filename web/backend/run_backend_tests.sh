#!/bin/bash
# Usage: run_backend_tests
#   [--from-code-checker] [--with-coverage] [--no-fail-on-first-error] [--with-debugger]
pushd /opt/tfplenum/web/backend > /dev/null || exit

FROM_CODE_CHECKER="pytest -ra"        # default: False
FAIL_ON_FIRST_ERROR="-x"    # default: True
WITH_DEBUGGER=""            # default: False
TEST_TYPE="acceptance"      # default: acceptance

POSITIONAL=()
while [[ $# -gt 0 ]]; do
    key="$1"

    case $key in
        --from-code-checker)
            echo "Running from docker": "${1}"
            FROM_CODE_CHECKER="/usr/bin/python3 -m pytest -ra"
            shift # shift once since flags have no values
        ;;

        --with-coverage)
            echo "Adding coverage": "${1}"
            COVERAGE="-p pytest_cov --cov=app"
            shift # shift once since flags have no values
        ;;

        --no-fail-on-first-error)
            echo "Telling Pytest not to fail on first error": "${1}"
            FAIL_ON_FIRST_ERROR=""
            shift # shift once since flags have no values
        ;;

        --with-debugger)
            echo "Telling Pytest to enable pdb debugger": "${1}"
            WITH_DEBUGGER="--pdb"
            shift # shift once since flags have no values
        ;;

        -T|--test-type)
            TEST_TYPE="${2}"
            if [ "$2" == "acceptance" ] || [ "$2" == "unit" ];
            then
                TEST_TYPE="${2}"
                echo "Running ${TEST_TYPE} Tests"
                shift
                shift
            else
                echo "You must specify a test type of either \"acceptance\" or \"unit\""
                exit 1
            fi
        ;;

        -h|--help)
            echo -e "\nUsage: run_backend_tests.sh -T (acceptance|unit) [--from-code-checker] [--with-coverage] [--no-fail-on-first-error] [--with-debugger]\n"
            exit 0
        ;;
        *)    # unknown option
            POSITIONAL+=("$1") # save it in an array for later
            shift # past argument
    esac
done

$FROM_CODE_CHECKER $FAIL_ON_FIRST_ERROR $WITH_DEBUGGER --durations-min=10.0 --junitxml=unit_test_results.xml -W ignore::DeprecationWarning $COVERAGE tests/$TEST_TYPE/
pushd /opt/tfplenum/web/backend > /dev/null || exit
