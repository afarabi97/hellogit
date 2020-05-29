import os
import logging
from models.stig import STIGSettings, ExecutorType
from util.api_tester import APITester
from util.connection_mngs import FabricConnectionWrapper
from util.ansible_util import execute_playbook, Target


class StigJob:
    def __init__(self, stig_settings: STIGSettings):
        self.stig_settings = stig_settings

    def _execute_stigs(self):
        if self.stig_settings.executor_type == ExecutorType.MAKE:
            with FabricConnectionWrapper(self.stig_settings.username,
                                         self.stig_settings.password,
                                         self.stig_settings.ipaddress) as client:
                with client.cd(self.stig_settings.make_execution_vars['path_to_make_dir']):
                    client.run(self.stig_settings.make_execution_vars['make_command'],
                               shell=self.stig_settings.make_execution_vars['shell'])
        elif self.stig_settings.executor_type == ExecutorType.PLAY:
            execute_playbook([self.stig_settings.play_execution_vars['play_path_to_site_yaml']],
                             extra_vars=self.stig_settings.play_execution_vars['play_extra_vars'],
                             targets=Target(
                                 self.stig_settings.play_execution_vars['play_targets'], self.stig_settings.play_execution_vars['play_ipaddress']),
                             tags=[
                                 self.stig_settings.play_execution_vars['play_tags']],
                             timeout=self.stig_settings.play_execution_vars['play_timeout'])

    def run_stig(self):
        self._execute_stigs()
