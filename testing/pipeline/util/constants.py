import os

PIPELINE_DIR = os.path.dirname(os.path.realpath(__file__)) + "/../"
TESTING_DIR = PIPELINE_DIR + "/../"
ROOT_DIR = TESTING_DIR + "/../"
GIP_DIR = ROOT_DIR + "/gip/"
VM_BUILDER_DIR =  ROOT_DIR + "/vm-builder/"
REPO_SYNC_PREFIX = "Reposync_Server"
CONTROLLER_PREFIX = "Controller"


# Files used within the CI/CD pipeline to skip building or recreating the template during the export-all pipeline.
SKIP_CTRL_BUILD_AND_TEMPLATE = ROOT_DIR + CONTROLLER_PREFIX + "_skip.txt"
SKIP_REPOSYNC_BUILD_AND_TEMPLATE = ROOT_DIR + REPO_SYNC_PREFIX + "_skip.txt"
