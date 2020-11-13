import os
import logging
from argparse import Namespace, ArgumentParser
from models import Model
from models.constants import SubCmd, RobotSubCmd
from util.yaml_util import YamlManager
from typing import List, Dict, Union

PIPELINE_DIR = os.path.dirname(os.path.realpath(__file__)) + "/../"
ROBOTEST_DIR = PIPELINE_DIR + "../robotest"
ROBOTEST_OUTPUT_DIR = PIPELINE_DIR + "../robotest-output"


class RobotSettings(Model):
    def __init__(self):
        super().__init__()
        self.system_name = None                 # from_namespace
        self.tfplenum_robot_container = None    # from_namespace
        self.jira_username = None               # from_namespace
        self.jira_password = None               # from_namespace
        self.jira_report = None                 # from_namespace
        self.jira_project_version = None        # from_namespace
        self.jira_project_key = None            # from_namespace
        self.robot_browser = None               # from_namespace
        self.robot_category = None              # from_namespace
        self.model_settings = None              # _get_model_settings_from_yaml
        self.username = None                    # _build_command
        self.password = None                    # _build_command
        self.ipaddress = None                   # _build_command
        self.command = None                     # _build_command


    @staticmethod
    def add_args(parser: ArgumentParser):
        """add_args [Static method that takes an ArgumentParser and adds the
        arguments it will need according to this Settings Model ]

        Args:
            parser (ArgumentParser): [description]
                RobotSubCmdself.tfplenum_robot_container       --tfplenum-robot-container
                RobotSubCmdself.jira_username                  --jira-username
                RobotSubCmdself.jira_password                  --jira-password
                RobotSubCmdself.jira_report                    --jira-report
                RobotSubCmdself.jira_project_version           --jira-project-version
                RobotSubCmdself.jira_project_key               --jira-project-key
                RobotSubCmdself.robot_browser                  --robot-browser
                RobotSubCmdself.robot_category                 --robot-category
                RobotSubCmdself.robot_variables                --robot-variables
        """
        # VARIABLES THAT CAN ONLY BE PASSED THROUGH GITLAB
        parser.add_argument('--tfplenum-robot-container', dest='tfplenum_robot_container', help='The docker image to pass in')
        parser.add_argument('--jira-username', dest='jira_username',  help="CONFLUENCE_USERNAME")
        parser.add_argument('--jira-password', dest='jira_password',  help="CONFLUENCE_DECODED_PASSWORD")
        parser.add_argument('--jira-report', dest='jira_report', help="JDS Report")
        parser.add_argument('--jira-project-version', dest='jira_project_version',  help="3.5")
        parser.add_argument('--jira-project-key', dest='jira_project_key', help="CONFLUENCE_PROJECT_KEY")
        parser.add_argument('--robot-browser', dest='robot_browser', help="BROWSER | Default: FireFox")
        parser.add_argument('--robot-category', dest='robot_category', help="Directory of the test")


    def from_namespace(self, namespace: Namespace):
        self.system_name = namespace.system_name
        self.tfplenum_robot_container = namespace.tfplenum_robot_container
        self.jira_username = namespace.jira_username
        self.jira_password = namespace.jira_password
        self.jira_report = namespace.jira_report
        self.jira_project_version = namespace.jira_project_version
        self.jira_project_key = namespace.jira_project_key
        self.robot_browser = namespace.robot_browser
        self.robot_category = namespace.robot_category
        self._get_model_settings_from_yaml()


    def _get_model_settings_from_yaml(self):
        if self.system_name == 'DIP':
            self.model_settings = YamlManager.load_ctrl_settings_from_yaml(self.system_name)
            self._build_command(self.model_settings)
        elif self.system_name == 'MIP':
            self.model_settings = YamlManager.load_ctrl_settings_from_yaml(
                self.system_name)
            self._build_command(self.model_settings)
        elif self.system_name == 'GIP':
            self.model_settings = YamlManager.load_gip_service_settings_from_yaml()
            self._build_command(self.model_settings)
        else:
            logging.info("There Is No Robot Test For The System: {}".format(self.system_name))


    def _build_command(self, model: Model):
        self.username = model.node.username
        self.password = model.node.password
        self.ipaddress = model.node.ipaddress
        """
          docker run -e JIRA_USERNAME -e JIRA_PASSWORD -e JIRA_PROJECT_KEY -i --network="host" -v $(pwd)/testing/robotest:/usr/src/robot/tests -v $(pwd)/testing/robotest-output:/usr/src/robot/output tfplenum/robot-automator:1.1.0 pipenv run python -m run.runner -c DIP_Test_Suite -r 'Ad hoc' -h -b Firefox

        docker run --env=JIRA_USERNAME={} --env='JIRA_PASSWORD={}' --env=JIRA_PROJECT_KEY={} -i --network="host"
        --volume={}/tests:/usr/src/robot/tests --volume={}:/usr/src/robot/output {} pipenv run python -m run.runner
        -c {} -r {} -p {} -h -b {} -v 'HOST:{}' -v 'USERNAME:{}'
        """
        # 1.    Environment Variables
        self.command = f"docker run --env=JIRA_USERNAME={self.jira_username} --env=JIRA_PASSWORD={self.jira_password} --env=JIRA_PROJECT_KEY={self.jira_project_key} -i --network=\"host\" "
        # 2.    Volume Mappings
        self.command += f"--volume={ROBOTEST_DIR}:/usr/src/robot/tests --volume={ROBOTEST_OUTPUT_DIR}:/usr/src/robot/output "
        # 3.    Tfplenum Container
        self.command += f"{self.tfplenum_robot_container} python3 -m run.runner "
        # 4.    Robotframework & Jira Variables that determine the output(category, report, project version)
        self.command += f"-c {self.robot_category} -r '{self.jira_report}' -p {self.jira_project_version} -h -b {self.robot_browser} "
        # 5.    Calculated Variables That Are Necessary To Run Robot on a specific machine
        self.command += f"-v HOST:{self.ipaddress} -v HOST_USERNAME:{self.username} -v HOST_PASSWORD:{self.password} "
        # 6.    TODO: All the variables passed to robot framework via gitlab
