import json
import os

from app import app, logger, conn_mng, CORE_DIR
from app.archive_controller import archive_form
from app.service.job_service import run_command2
from app.service.socket_service import noify_clock_refresh
from datetime import datetime, timedelta
from fabric.connection import Connection
from fabric.runners import Result
from invoke.exceptions import UnexpectedExit
from shared.constants import KIT_ID, KICKSTART_ID
from shared.connection_mngs import FabricConnectionManager
from shared.utils import decode_password
from typing import Dict, Tuple, Union, List


class TimeChangeFailure(Exception):
    pass


def zero_pad(num: Union[int, str]) -> str:
    """
    Zeros pads the numers that are lower than 10.

    :return: string of the new number.
    """
    if isinstance(num, str):
        num = int(num)

    if num < 10:
        return "0" + str(num)
    return num


class DatetimeService:

    def __init__(self, timeForm: Dict, master_node_ipaddress: str):
        hours, minutes, seconds = timeForm['time'].split(':')
        self._set_hwclock_cmd = "hwclock --systohc --utc" # Sets hardware clock to systemtime and changes the timezone to UTC with appropriate offset.
        self._command_date_format = '%Y-%m-%d %H:%M:%S'
        self._timezone_cmd = 'timedatectl set-timezone {}'.format(timeForm['timezone'])
        self._initial_time = '{year}-{month}-{day} {hours}:{minutes}:{seconds}'.format(year=timeForm['date']['year'],
                                                                                       month=zero_pad(timeForm['date']['month']),
                                                                                       day=zero_pad(timeForm['date']['day']),
                                                                                       hours=hours,
                                                                                       minutes=minutes,
                                                                                       seconds=seconds)
        self._unset_ntp_cmd = 'timedatectl set-ntp false'
        self._set_ntp_cmd = 'timedatectl set-ntp true'
        self._initial_datetime = datetime.strptime(self._initial_time, self._command_date_format) # type: datetime
        self._start_utc = datetime.utcnow()
        self._chrony_burst_cmd = "chronyd -q 'server {} iburst'".format(master_node_ipaddress)

    def _get_elapsed_time(self) -> timedelta:
        end_utc = datetime.utcnow()
        return end_utc - self._start_utc # type: timedelta

    def _get_timecommand(self, time_to_set: datetime) -> str:
        inital_time = time_to_set.strftime(self._command_date_format)
        time_cmd = "timedatectl set-time '{}'".format(inital_time)
        return time_cmd

    def _set_clock_using_timedatectl(self, cmd: Connection, ip_address: str):
        elapsed_time = self._get_elapsed_time() # type: timedelta
        command = self._get_timecommand(self._initial_datetime + elapsed_time)
        ret_val = cmd.run(command)
        if ret_val.return_code != 0:
            raise TimeChangeFailure("Failed to run {} on {}".format(command, ip_address))

    def _has_chronyd(self, cmd: Connection) -> bool:
        try:
            ret_val = cmd.run("chronyd --help", hide=True)
            if ret_val.return_code == 0:
                return True
        except UnexpectedExit:
            pass
        return False

    def _set_clock_using_chronyd(self, cmd: Connection, ip_address: str):
        cmd.run('systemctl stop chronyd')
        ret_val = cmd.run(self._chrony_burst_cmd)
        if ret_val.return_code != 0:
            raise TimeChangeFailure("Failed to run chronyd burst command on {}.".format(ip_address))

        ret_val = cmd.run('systemctl start chronyd')
        if ret_val.return_code != 0:
            raise TimeChangeFailure("Failed to start chronyd service on {}".format(ip_address))

    def _ctrl_has_chronyd(self) -> bool:
        _, ret_val = run_command2("chronyd --help", use_shell=True)
        if ret_val == 0:
            return True
        return False

    def _set_ctrl_clock_using_timedatectl(self):
        elapsed_time = self._get_elapsed_time() # type: timedelta
        command = self._get_timecommand(self._initial_datetime + elapsed_time)
        _, ret_val = run_command2(command)
        if ret_val != 0:
            raise TimeChangeFailure("Failed to run {} on controller.".format(command))

    def _set_ctrl_clock_using_chronyd(self):
        run_command2('systemctl stop chronyd')
        _, ret_val = run_command2(self._chrony_burst_cmd)
        if ret_val != 0:
            raise TimeChangeFailure("Failed to run chronyd burst command on ctrl.")

        _, ret_val = run_command2('systemctl start chronyd')
        if ret_val != 0:
            raise TimeChangeFailure("Failed to start chronyd service on ctrl.")

    def change_time_on_target(self,
                              password: str,
                              ip_address: str,
                              is_master_server: bool) -> None:
        """
        Executes commands

        :param password: The ssh password of the box.
        :param ip_address: The IP Address of the node.
        :param is_master_server: True if this is the master server node which always runs timedatectl

        :return:
        """
        with FabricConnectionManager('root', password, ip_address) as cmd:
            ret_val = cmd.run(self._timezone_cmd) # type: Result
            if ret_val.return_code != 0:
                raise TimeChangeFailure("Failed to run {} on {}".format(self._timezone_cmd, ip_address))

            cmd.run(self._unset_ntp_cmd, warn=True)
            if is_master_server:
                self._set_clock_using_timedatectl(cmd, ip_address)
            else:
                if self._has_chronyd(cmd):
                    self._set_clock_using_chronyd(cmd, ip_address)
                else:
                    self._set_clock_using_timedatectl(cmd, ip_address)

            ret_val = cmd.run(self._set_hwclock_cmd)
            if ret_val.return_code != 0:
                raise TimeChangeFailure("Failed to run {} on {}".format(self._set_hwclock_cmd, ip_address))

            cmd.run(self._set_ntp_cmd, warn=True)


    def set_controller_clock(self, use_timedatectl: bool):
        _, ret_val = run_command2(self._timezone_cmd)
        if ret_val != 0:
            raise TimeChangeFailure("Failed to run {} on controller.".format(self._timezone_cmd))

        run_command2(self._unset_ntp_cmd)
        if use_timedatectl:
            self._set_ctrl_clock_using_timedatectl()
        else:
            if self._ctrl_has_chronyd():
                try:
                    self._set_ctrl_clock_using_chronyd()
                except TimeChangeFailure:
                    self._set_ctrl_clock_using_timedatectl()
            else:
                self._set_ctrl_clock_using_timedatectl()

        _, ret_val = run_command2(self._set_hwclock_cmd)
        if ret_val != 0:
            raise TimeChangeFailure("Failed to run {} on controller.".format(self._set_hwclock_cmd))
        run_command2(self._set_ntp_cmd)


def _reorder_nodes_and_put_master_first(nodes: List[Dict]):
    node_cache = None
    index_cache = None
    for index, node in enumerate(nodes):
        try:
            is_master = node['is_master_server']
        except KeyError:
            is_master = False

        if index == 0 and is_master:
            return

        if is_master:
            node_cache = node
            index_cache = index
            break
    del nodes[index_cache]
    nodes.insert(0, node_cache)


def change_time_on_nodes(payload: Dict, password: str) -> None:
    """
    Sets the time on the nodes.  This function throws an exception on failure.

    :param payload: The dictionary object containing the payload.
    :return: None
    """
    timeForm = payload['timeForm']
    _reorder_nodes_and_put_master_first(payload['kitForm']["nodes"])
    dt_srv = DatetimeService(timeForm, payload['kitForm']["nodes"][0]["management_ip_address"])
    for node in payload['kitForm']["nodes"]:
        try:
            is_master = node['is_master_server']
        except KeyError:
            is_master = False
        dt_srv.change_time_on_target(password, node["management_ip_address"], is_master)

    dt_srv.set_controller_clock(True)
    noify_clock_refresh()


def change_time_on_kit(timeForm: Dict):
    kickstart = conn_mng.mongo_kickstart.find_one({"_id": KICKSTART_ID})
    kit = conn_mng.mongo_kit.find_one({"_id": KIT_ID})
    if kit and kickstart:
        _reorder_nodes_and_put_master_first(kit['form']["nodes"])
        dt_srv = DatetimeService(timeForm, kit['form']["nodes"][0]["management_ip_address"])
        password = decode_password(kickstart['form']['root_password'])
        for node in kit['form']["nodes"]:
            try:
                is_master = node['is_master_server']
            except KeyError:
                is_master = False
            dt_srv.change_time_on_target(password, node["management_ip_address"], is_master)

        dt_srv.set_controller_clock(False)
        noify_clock_refresh()
    else:
        raise TimeChangeFailure("Failed to change time as this kit has not been provisioned yet.")
