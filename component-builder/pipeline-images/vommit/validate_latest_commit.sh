#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

pushd "$SCRIPT_DIR" > /dev/null || exit

echo -e "\nPerforming Validation Upon The Most Recent Commit: $(git log -1 --pretty=%H)"
echo -e "-------------------------------------------------------------------------------------------\n\n"

exit_code=$? # save the exit code in a variable
docker run --ulimit nofile=1024 -v "$(pwd)/../../../":/repo/ --rm docker.nexus.sil.lab/tfplenum/vommit:0.1 gitlint --extra-path /root/rules -vv --commit "$(git log -1 --pretty=%H)" || exit_code=$?; if [ $exit_code -ne 0 ]; then echo -e "\nThe Total Errors: $exit_code\n"; exit 1; else echo -e "GITLINT PASSED\n"; fi;
# Replace the uncommented code in line 20 with the following code (line 22) in order to see a failing test. Change the commit hash to test arbitrary commits. The first echo will remain the same (the current commit) but the hash validated will be different.
# docker run --ulimit nofile=1024 -v "$(pwd)/../../../":/repo/ --rm docker.nexus.sil.lab/tfplenum/vommit:0.1 gitlint --extra-path /root/rules -vv --commit "99bdd2859ea8e26d9d02608b77ec1007f2bd8fb4" || exit_code=$?; if [ $exit_code -ne 0 ]; then echo -e "\nThe Total Errors: $exit_code\n"; exit 1; else echo -e "GITLINT PASSED\n"; fi;
popd > /dev/null || exit

