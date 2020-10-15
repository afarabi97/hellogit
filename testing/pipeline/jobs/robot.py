import os
import logging
import subprocess
from models.robot import RobotSettings
from typing import List, Dict, Union

class RobotJob:
    def __init__(self, robot_settings: RobotSettings):
        self.robot_settings = robot_settings

    def _execute_robot_tests(self):
        proc = subprocess.Popen(
            self.robot_settings.command,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)
        stdout, stderr = proc.communicate()
        if proc.returncode != 0:
            print(f"stdout {stdout.decode('utf-8')} stderr {stderr}")

    def run_robot(self):
        self._execute_robot_tests()
