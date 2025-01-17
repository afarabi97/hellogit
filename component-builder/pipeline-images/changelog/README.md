# Changelog Generation Tool

This tool helps generate changelogs for CVA/H. It is intended For internal use only.

## Installation

### Docker Installation

> **IMPORTANT**: ***This method of install requires docker to be installed and for you to have access to the remote repository that hosts the changelog image.***

This is the recommended method of installation. Ensure you have access to the remote repository that hosts the image. This usually requires you to be logged in via a VPN.


1. Pull the image from the remote repository:

    ```bash
    # Please substitute <VERSION> with the version of the tool you want to install.
    docker pull docker.nexus.sil.lab/tfplenum/changelog:<VERSION>
    ```

2. Run the container on your local machine:

    ```bash
    # Please substitute <REPO_DIR> with the root tfplenum folder and <VERSION> with the version of the tool you have pulled from the remote repository.
    # On the controller the root tfplenum folder is /opt/tfplenum
    # This just runs the help command to show you the available commands.
    docker run -v <REPO_DIR>:/tfplenum docker.nexus.sil.lab/tfplenum/changelog:<VERSION> --help
    ```

### Manual Installation

> **IMPORTANT**: ***This method of install requires python 3.11 or higher and poetry to be installed***

The tool can be installed via python as a wheel file. The wheel file can be generated using the python dependency manager poetry.

1. Navigate to the changelog directory and locate the `pyproject.toml` file:

    ```bash
    pushd component-builder/pipeline-images/changelog
    ls pyproject.toml # Should be in the current directory
    ```
2. Run poetry commands to generate the wheel file:

    ```bash
    poetry install && poetry build
    ```

3. Install the wheel file via pip:

    ```bash
    pip install dist/changelog-<VERSION>-py3-none-any.whl && source ~/.bashrc
    ```

## Build

To build this pipeline image for production you can use The `build.sh` script. For ease of use the script generates actions that can be copied and pasted into your terminal. Be mindful of that when updating the tool.

> **IMPORTANT: *When updating the tool, make sure that the actions generated by the script are updated as well and that they are accurate.***

### Docker Image Build

Follow these steps to build the docker image. The steps below assume that you are starting from the tfplenum root directory which is `/opt/tfplenum/` if you were on the controller:

> **IMPORTANT:** ***The build script builds the image locally. It does not publish the image to nexus. Publishing to the remote repo MUST BE DONE MANUALLY.***

#### 1. Navigate to the changelog directory and locate the `pyproject.toml` file:

```bash
pushd component-builder/pipeline-images/changelog
ls pyproject.toml # Should be in the current directory
```

#### 2. ***OPTIONAL***: If you made any changes to the tool that you have commited, then update the version number within the `pyproject.toml` file:

```txt
[tool.poetry]
name = "changelog"
version = "<UPDATE_VERSION_HERE>"
description = "The changelog generation tool for CVA/H. For internal use only."
```

#### 3. Run the `build.sh` script as `sudo` to generate a local docker image:

```bash
sudo bash build.sh
```

For more information on the build script use the `--help` flag:

```bash
# Don't mess up the spelling of any flags
# Missplled flags will cause the script to build
sudo bash build.sh --help
```

Here is the sample output for the build scripts help menu

```bash
Usage: build.sh [--actions-only] [--build-only] [--help]
  --actions-only: Only generate the commands for the actions
  --build-only: Only build the docker image locally
  --help: Display this help message
```


#### 4. Copy and Paste an `Action Command` from the build script's output into your terminal

> **NOTE**: The script will substitute the generated variables for you **`<GENERATED_*>`**. Just copy and paste the command you want to run into your terminal.

```bash
# Sample output of the build script
Choose Action -> Highlight Command ->  Copy Command -> Paste Command -> Execute Command:

1. Test image locally (dev workstation that is not a controller)

docker run -v <GENERATED_APP_DIR>:/app -v <GENERATED_REPO_DIR>:/tfplenum tfplenum/changelog:<GENERATED_VERSION> --help

2. Preview changelog for branch <GENERATED_PREVIEW_BRANCH> against release branch <GENERATED_RELEASE_BRANCH>:

docker run -v <GENERATED_APP_DIR>:/app -v <GENERATED_REPO_DIR>:/tfplenum tfplenum/changelog:<GENERATED_VERSION> generate unreleased --from <GENERATED_PREVIEW_BRANCH> --against <GENERATED_RELEASE_BRANCH> --output-directory <GENERATED_TEMP_OUTPUT_DIR> && ls -al <GENERATED_REPO_DIR>/.tmp/changelog_build_output/preview_changelog

3. Publish the new image. This assumes you have the proper access and rights to push to the remote repository:

docker tag tfplenum/changelog:<GENERATED_VERSION> docker.nexus.sil.lab/tfplenum/changelog:<GENERATED_VERSION> && docker push docker.nexus.sil.lab/tfplenum/changelog:<GENERATED_VERSION>

4. Open the .gitlab-ci.yml file so you can update the LATEST_CHANGELOG_IMAGE variable with the new version which is (<GENERATED_VERSION>):

vi <GENERATED_REPO_DIR>/.gitlab-ci.yml

 5. Troubleshoot the image inside its container

docker run -it --entrypoint "bash" -v <GENERATED_REPO_DIR>:/app -v <GENERATED_REPO_DIR>:/tfplenum tfplenum/changelog:<GENERATED_VERSION>
```


## CLI Usage

The tool is used to generate changelogs for CVA/H. Make sure you are somewhere in the tfplenum directory when running the tool. The tool has a help command that can be used to see the available commands and options. Below are some examples of how to use the tool.

For Docker usage see [Step 4 of The Docker Installation Section](#4-copy-and-paste-an-action-command-from-the-build-scripts-output-into-your-terminal) section.

```bash
# Show the help menu for the command or subcoommand
changelog generate --help
changelog generate release --help
changelog generate unreleased --help

# Generate a changelog for the latest release branch
# changelog generate release --output-directory <OUTPUT_DIR>
changelog generate release --output-directory /tmp/changelog

# Generate a changelog for all the release branches from <RELEASE_VERSION> to <RELEASE_VERSION>
# changelog generate release --from <RELEASE_VERSION> --to <RELEASE_VERSION> --output-directory <OUTPUT_DIR>
changelog generate release --from '3.8' --to '3.9' --output-directory /tmp/changelog

# Generate a changelog for the unreleased changes between two branches
# changelog generate unreleased --from <BRANCH_NAME> --against <BRANCH_NAME> --output-directory <OUTPUT_DIR>
changelog generate unreleased --from 'devel' --against '3.8' --output-directory /tmp/changelog

# Take a directory of markdown files and convert them to html files in a directory of your choosing
# changelog dir2html --input-directory <INPUT_DIR> --output-directory <OUTPUT_DIR>
changelog dir2html --input-directory /temp/tfplenum/changelogs --output-directory /temp/tfplenum/changelog/html
```

## Development

### Poetry

This tool uses poetry to manage its dependencies. To install poetry follow the instructions [here](https://python-poetry.org/docs/#installation).

#### Poetry Commands

```bash
# Install dependencies
poetry install

# Run the tool
poetry run changelog

# Run the tool with arguments
poetry run changelog generate --help
```

### Testing

This tool uses pytest to run its tests. To install pytest run the following command:

```bash
poetry install --group dev
```

#### Running Tests Using Pytest

To run the tests using pytest, run `pytest` in the root directory of the tool. This will run all the tests in the `tests` directory but will not generate a coverage report.

Here's a useful pytest command with options *(This assumes you are in the root directory of the changelog tool itself)*:

```bash
# Run all the tests in the tests directory
# show all failures and Errors
# disable warnings
# stop on first failure
# open a python debugger on failure
# use the .coveragerc file for coverage configuration
# show the coverage report in the terminal
# generate a coverage report in html format
# only generate coverage for the files in the changelog/changelog directory.
pytest tests -r fE --disable-warnings -x --pdb \
    --cov-config=.coveragerc --cov-report=term \
    --cov-report=html --cov=./changelog/changelog
```

Here's another useful pytest command with options *(This also assumes you are in the root directory of the changelog tool itself)*:

```bash
# Run only the tests in the tests/test_changelog.py file
# show all failures and errors
# disable warnings
# stop on first failure
# open a python debugger on failure
# use the .coveragerc file for coverage configuration
# show the coverage report in the terminal
# generate a coverage report in html format
# only generate coverage for the files in the changelog/changelog directory.
pytest tests/test_changelog.py -r fE --disable-warnings -x --pdb \
    --cov-config=.coveragerc --cov-report=term \
    --cov-report=html --cov=./changelog/changelog
```

#### *(WIP)* Running Tests Via The Test Script

To run the tests using the test script, run the `bash run_tests.sh`. The script will run all the tests in the `tests` directory and will generate a coverage report.

If a test fails, the script will stop test execution and open a python debugger. You can use the debugger to inspect the state of the program at the time of the failure. You can exit the debugger by typing `exit`,  `quit` and pressing enter. The script will then exit without running the rest of the tests.

```bash
# Run all the tests in the tests directory
bash run_tests.sh

# Run the tests and Open the coverage report in the default browser
xdg-open htmlcov/index.html

# Open the coverage report in a specific browser
firefox htmlcov/index.html
chromium htmlcov/index.html
chrome htmlcov/index.html
edge htmlcov/index.html
```
