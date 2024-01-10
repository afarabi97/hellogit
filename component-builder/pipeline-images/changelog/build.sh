#!/usr/bin/bash

# Ensure the script exits if any errors occur
set -e


# Ensure we are in a tfplenum repository and save the root path
TFPLENUM_ROOT=$(git rev-parse --show-toplevel)
if [[ "${TFPLENUM_ROOT}" != *"/tfplenum"* ]]; then
    echo "ERROR: Unable to find tfplenum root directory. Exiting..."
    exit 1
fi

# Define image name and version using the pyproject.toml file
IMAGE_NAME=$(grep -E '^name' pyproject.toml | cut -d'"' -f2) || true
IMAGE_VERSION=$(grep -E '^version' pyproject.toml | cut -d'"' -f2) || true

# Define a function to output a success message
function show_action_commands() {

    function _generate_action_command_output() {
        # Generate the commad volume mapping and local image+version mapping for the docker actions

        local GENERATED_APP_DIR_VOL="${TFPLENUM_ROOT}/component-builder/pipeline-images/changelog:/app"
        local GENERATED_REPO_DIR_VOL="${TFPLENUM_ROOT}:/tfplenum"
        local GENERATED_LOCAL_IMAGE="tfplenum/${IMAGE_NAME}:${IMAGE_VERSION}"
        local TOOL_GENERATE_UNRELEASED_SUBCOMMAND="generate unreleased"

        # The base docker run command for all actions
        local GENERATED_DOCKER_RUN="docker run -v ${GENERATED_APP_DIR_VOL} -v ${GENERATED_REPO_DIR_VOL} ${GENERATED_LOCAL_IMAGE}"

        # The base docker troupleshoot command for all actions
        local GENERATED_DOCKER_RUN_TROUBLESHOOT="docker run -it --entrypoint \"bash\" -v ${GENERATED_REPO_DIR_VOL} ${GENERATED_LOCAL_IMAGE}"

        # Generate the variables for the tool itself
        local GENERATED_PREVIEW_BRANCH="devel"
        local GENERATED_RELEASE_BRANCH="3.9"
        local GENERATED_RELATIVE_TEMP_OUTPUT_PATH=".tmp/changelog_build_output"
        local GENERATED_TEMP_OUTPUT_DIR="/tfplenum/${GENERATED_RELATIVE_TEMP_OUTPUT_PATH}"

        # Create the temp output directory if it does not exist
        mkdir -p "${GENERATED_TEMP_OUTPUT_DIR}"

        # 1. Variables for the test image locally action
        local TEST_IMAGE_LOCALLY_TOOL_FLAG="--help"
        # 1. COMMAND
        local TEST_IMAGE_LOCALLY_DOCKER_COMMAND="${GENERATED_DOCKER_RUN} ${TEST_IMAGE_LOCALLY_TOOL_FLAG}"

        # 2. Variables for the preview changelog action
        local PREVIEW_CHANGELOG_DIRNAME="preview_changelog"
        local PREVIEW_CHANGELOG_FROM_TOOL_FLAG="--from ${GENERATED_PREVIEW_BRANCH}"
        local PREVIEW_CHANGELOG_AGAINST_TOOL_FLAG="--against ${GENERATED_RELEASE_BRANCH}"
        local PREVIEW_CHANGELOG_OUTPUT_DIR_TOOL_FLAG="--output-directory ${GENERATED_TEMP_OUTPUT_DIR}/${PREVIEW_CHANGELOG_DIRNAME}"

        local PREVIEW_CHANGELOG_SHOW_WITH_LS="ls -la ${TFPLENUM_ROOT}/${GENERATED_RELATIVE_TEMP_OUTPUT_PATH}/${PREVIEW_CHANGELOG_DIRNAME}"

        # 2. COMMAND
        local PREVIEW_CHANGELOG_DOCKER_COMMAND="${GENERATED_DOCKER_RUN} ${TOOL_GENERATE_UNRELEASED_SUBCOMMAND} ${PREVIEW_CHANGELOG_FROM_TOOL_FLAG} ${PREVIEW_CHANGELOG_AGAINST_TOOL_FLAG} ${PREVIEW_CHANGELOG_OUTPUT_DIR_TOOL_FLAG} && ${PREVIEW_CHANGELOG_SHOW_WITH_LS}"

        # 3. Variables for the publish image action
        local PUBLISH_IMAGE_DOCKER_COMMAND="docker tag ${GENERATED_LOCAL_IMAGE} docker.nexus.sil.lab/${GENERATED_LOCAL_IMAGE} && docker push docker.nexus.sil.lab/${GENERATED_LOCAL_IMAGE}"

        # 4. Variables for the update .gitlab-ci.yml action
        local UPDATE_GITLAB_CI_FILE_COMMAND="vi ${TFPLENUM_ROOT}/.gitlab-ci.yml"

        # Generate the output for the actions
        echo -e "Generated Action Command Output:"
        echo -e "--------------------------------"
        echo -e "Directions: Choose Action -> Highlight Command ->  Copy Command -> Paste Command -> Execute Command:\n"
        echo -e "1. Test image locally (dev workstation that is not a controller):"
        echo -e "${TEST_IMAGE_LOCALLY_DOCKER_COMMAND}\n"

        echo -e "2. Preview changelog for branch ${GENERATED_PREVIEW_BRANCH} against release branch ${GENERATED_RELEASE_BRANCH}:"
        echo -e "${PREVIEW_CHANGELOG_DOCKER_COMMAND}\n"

        echo -e "3. Publish the new image. This assumes you have the proper access and rights to push to the remote repository:"
        echo -e "${PUBLISH_IMAGE_DOCKER_COMMAND}\n"

        echo -e "4. Open the .gitlab-ci.yml file so you can update the LATEST_CHANGELOG_IMAGE variable with the new version which is (${GENERATED_LOCAL_IMAGE}):"
        echo -e "${UPDATE_GITLAB_CI_FILE_COMMAND}\n"


        echo -e "5. Troubleshoot the image inside its container"
        echo -e "${GENERATED_DOCKER_RUN_TROUBLESHOOT}\n"


        # Choose Action -> Highlight Command ->  Copy Command -> Paste Command -> Execute Command:

        # 1. Test image locally (dev workstation that is not a controller)

        # docker run -v <GENERATED_APP_DIR>:/app -v <GENERATED_REPO_DIR>:/tfplenum tfplenum/changelog:<GENERATED_VERSION> --help

        # 2. Preview changelog for branch <GENERATED_PREVIEW_BRANCH> against release branch <GENERATED_RELEASE_BRANCH>:

        # docker run -v <GENERATED_APP_DIR>:/app -v <GENERATED_REPO_DIR>:/tfplenum tfplenum/changelog:<GENERATED_VERSION> generate unreleased --from <GENERATED_PREVIEW_BRANCH> --against <GENERATED_RELEASE_BRANCH> --output-directory <GENERATED_TEMP_OUTPUT_DIR> && ls -la <GENERATED_REPO_DIR>/.tmp/changelog_build_output/preview_changelog/

        # 3. Publish the new image. This assumes you have the proper access and rights to push to the remote repository:

        # docker tag tfplenum/changelog:<GENERATED_VERSION> docker.nexus.sil.lab/tfplenum/changelog:<GENERATED_VERSION> && docker push docker.nexus.sil.lab/tfplenum/changelog:<GENERATED_VERSION>

        # 4. Open the .gitlab-ci.yml file so you can update the LATEST_CHANGELOG_IMAGE variable with the new version which is (<GENERATED_VERSION>):

        # vi <GENERATED_REPO_DIR>/.gitlab-ci.yml

        # 5. Troubleshoot the image inside its container

        # docker run -it --entrypoint "bash" -v <GENERATED_REPO_DIR>:/app -v <GENERATED_REPO_DIR>:/tfplenum tfplenum/changelog:<GENERATED_VERSION>
    }

    echo -e "Successfully built and tagged locally: ${IMAGE_NAME}:${VERSION}"
    _generate_action_command_output
}

function build_docker_image_locally() {
    # Navigate to the scripts directory
    pushd "$(dirname "$0")"
    echo "Navigated to directory: ${PWD}"

    # Build the Docker image locally and tag with latest version
    docker build -t "tfplenum/${IMAGE_NAME}:${IMAGE_VERSION}" .

    # Navigate back to the original directory
    popd >/dev/null || exit
    echo "Navigated back to directory: ${PWD}" || true

    echo "Successfully built and tagged locally: ${IMAGE_NAME}:${IMAGE_VERSION}"
}

function runitgoshdarnit() {
    # if the flag --actions is passed, then we will generate the commands for the actions
    if [[ "$1" == "--actions-only" ]]; then
        show_action_commands
        return 0
    elif [[ "$1" == "--build-only" ]]; then
        build_docker_image_locally
        return 0
    elif [[ "$1" == "--help" ]]; then
        echo -e "Usage: $0 [--actions-only] [--build-only] [--help]"
        echo -e "  --actions-only: Only generate the commands for the actions"
        echo -e "  --build-only: Only build the docker image locally"
        echo -e "  --help: Display this help message"
        return 0
    else
        build_docker_image_locally
        show_action_commands
    fi
}

runitgoshdarnit "$@"
