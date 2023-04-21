#!/usr/bin/env sh

SCRIPT_DIR="$( cd "$( dirname "${0}" )" >/dev/null && pwd )"
DOCKER_IMAGE_VERSION=1.0.2
TEST_ONE_EXPECTED_EXIT_CODE=5
TEST_TWO_EXPECTED_EXIT_CODE=0
TEST_THREE_EXPECTED_EXIT_CODE=8
FAILED_TESTS=0
SEP="-------------------------------------------------------------------------------------------"
SEP2="==========================================================================================="


pushd "$SCRIPT_DIR" > /dev/null || exit
echo "$(pwd)"

header () {
    printf '\n%s\n%s\n%s\n' "$SEP" "$1" "$SEP"
}


results () {
    if [ "$#" -ne 2 ]; then return; fi;
    local received_exit_code="$1"
    local expected_exit_code="$2"
    status="PASS"
    if [ "$received_exit_code" -ne "$expected_exit_code" ]; then
        status="FAIL"
        printf '%s\n\nTEST STATUS:\t%s\nEXPEC ERRORS:\t%s\nTOTAL ERRORS:\t%s\n%s\n\n' "$SEP" "$status" "$expected_exit_code" "$received_exit_code" "$SEP2";
        FAILED_TESTS=$((FAILED_TESTS+1))
        exit 1;
    fi

    printf '%s\n\nTEST STATUS:\t%s\nEXPEC ERRORS:\t%s\nTOTAL ERRORS:\t%s\n%s\n\n' "$SEP" "$status" "$expected_exit_code" "$received_exit_code" "$SEP2";
}

final () {
    printf '\n\n%s\nFAILED TESTS:\t%s\n%s\n\n' "$SEP2" "$FAILED_TESTS" "$SEP2";
    popd > /dev/null || exit
}

header "Performing Validation Of Text Passed To STDIN"
HEREDOC_FILE=$(mktemp)
cat << EOF > "${HEREDOC_FILE}"
(feat) fsdf-13943: Dell 6515 Software RAID change 5 errors

    - Removed unneeded fields from Add Node dialog box
    - Added RAID0 override
- Added switch configuration for S5212F-ON.
- Added size check on sda and sdb drives so if sdb is
- smaller it ends up as OS drive instead of data drive.
    -Fixed bug in UI so the dialog renders when no device
- facts are present on a given node.
        - Fixed kubectl add node bug with remote sensor.
            - Added new kickstart logic to support Dell PowerEdge XR4510c
                - Added hardware check logic for unexpected configurations.
- Added aux switch for dell 5212

Issue: https://jira.levelup.cce.af.mil/browse/AFDCO-13943
Closes: AFDCO-13943
Closes: sdflkj
(cherry picked from commit ac1c95d4)
(cherry picked from commit 6f3ca5be)
EOF
docker run --ulimit nofile=1024 -v "$(pwd)/../../../":/repo/ -v "${HEREDOC_FILE}":/root/test_commit.txt --rm docker.nexus.sil.lab/tfplenum/vommit:${DOCKER_IMAGE_VERSION} --config /root/.gitlint-docker --msg-filename /root/test_commit.txt || exit_code=$?; results $exit_code $TEST_ONE_EXPECTED_EXIT_CODE;

exit_code=0;
header "Performing Validation Upon The Most Recent Commit: $(git log -1 --pretty=%H)"
docker run --ulimit nofile=1024 -v "$(pwd)/../../../":/repo/ --rm docker.nexus.sil.lab/tfplenum/vommit:${DOCKER_IMAGE_VERSION} --config /root/.gitlint-docker || exit_code=$?; results $exit_code $TEST_TWO_EXPECTED_EXIT_CODE;


header "Performing Validation For A Known Bad Commit: 99bdd2859ea8e26d9d02608b77ec1007f2bd8fb4"
docker run --ulimit nofile=1024 -v "$(pwd)/../../../":/repo/ --rm docker.nexus.sil.lab/tfplenum/vommit:${DOCKER_IMAGE_VERSION} --config /root/.gitlint-docker --commit "99bdd2859ea8e26d9d02608b77ec1007f2bd8fb4" || exit_code=$?; results $exit_code $TEST_THREE_EXPECTED_EXIT_CODE;

final
