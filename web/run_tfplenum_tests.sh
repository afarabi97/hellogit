#!/bin/bash
# Usage: run_tfplenum_tests.sh
#   [-T|--test-type] (acceptance|unit) [-S|--test-section] (backend|frontend) [--with-coverage] [--no-fail-on-first-error] [--with-debugger]

FAIL_ON_FIRST_ERROR="-x"    # default: True
WITH_DEBUGGER=""            # default: False
TEST_TYPE="acceptance"      # default: acceptance
TEST_RESULTS_FILE="${TEST_TYPE}_test_results.xml"
TEST_RESULTS_OUTPUT="--junitxml=${TEST_RESULTS_FILE}_test_results.xml"
TEST_SECTION="backend"      # default: backend
TEST_WORKING_DIR="/opt/tfplenum/web/${TEST_SECTION}"


POSITIONAL=()
while [[ $# -gt 0 ]]; do
    key="$1"

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
                TEST_RESULTS_FILE="${TEST_TYPE}_test_results.xml"
                TEST_RESULTS_OUTPUT="--junitxml=${TEST_RESULTS_FILE}"
                echo "Running ${TEST_TYPE} Tests"
                echo "Outputting results to $TEST_RESULTS_FILE"
                shift
                shift
            else
                echo "You must specify a test type of either \"acceptance\" or \"unit\""
                exit 1
            fi
        ;;

        -S|--test-section)
            TEST_SECTION="${2}"
            if [ "$2" == "backend" ] || [ "$2" == "frontend" ];
            then
                TEST_SECTION="${2}"
                TEST_WORKING_DIR="/opt/tfplenum/web/${TEST_SECTION}"
                echo "Running ${TEST_TYPE} Tests"
                echo "Outputting results to $TEST_RESULTS_FILE"
                shift
                shift
            else
                echo "You must specify a test type of either \"acceptance\" or \"unit\""
                exit 1
            fi
        ;;

        -h|--help)
            echo -e "\nUsage: ./run_tfplenum_tests.sh -T (acceptance|unit) -S (backend|frontend) [--from-code-checker] [--with-coverage] [--no-fail-on-first-error] [--with-debugger]\n"
            exit 0
        ;;
        *)    # unknown option
            POSITIONAL+=("$1") # save it in an array for later
            shift # past argument
    esac
done
pushd "${TEST_WORKING_DIR}" > /dev/null || exitf
pytest -ra $FAIL_ON_FIRST_ERROR $WITH_DEBUGGER --durations-min=10.0 $TEST_RESULTS_OUTPUT -W ignore::DeprecationWarning $COVERAGE tests/$TEST_TYPE/
popd > /dev/null || exit
