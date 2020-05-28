import json
import os

from app import app, logger, conn_mng, CORE_DIR
from app.archive_controller import archive_form
from app.service.job_service import run_command2
from app.service.socket_service import notify_clock_refresh
from app.service.system_info_service import get_system_name
from datetime import datetime, timedelta
from fabric.connection import Connection
from fabric.runners import Result
from invoke.exceptions import UnexpectedExit
from shared.constants import KIT_ID, KICKSTART_ID
from shared.connection_mngs import FabricConnectionManager
from shared.utils import decode_password
from typing import Dict, Tuple, Union, List
from pymongo import ReturnDocument


FAILURE_MSG = "Failed to run {} on {}"
FAILURE_MSG_CTRL = "Failed to run {} on controller."


class TimeChangeFailure(Exception):
    pass


class NodeDirtyException(Exception):
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

    def __init__(self, time_form: Dict, master_node_ipaddress: str):
        hours, minutes, seconds = time_form['time'].split(':')
        self._set_hwclock_cmd = "hwclock --systohc --utc" # Sets hardware clock to systemtime and changes the timezone to UTC with appropriate offset.
        self._command_date_format = '%Y-%m-%d %H:%M:%S'
        self._timezone_cmd = 'timedatectl set-timezone {}'.format(time_form['timezone'])
        self._initial_time = '{year}-{month}-{day} {hours}:{minutes}:{seconds}'.format(year=time_form['date']['year'],
                                                                                       month=zero_pad(time_form['date']['month']),
                                                                                       day=zero_pad(time_form['date']['day']),
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

    def _set_clock_using_timedatectl(self, cmd: Connection, hostname: str):
        elapsed_time = self._get_elapsed_time() # type: timedelta
        command = self._get_timecommand(self._initial_datetime + elapsed_time)
        ret_val = cmd.run(command)
        if ret_val.return_code != 0:
            raise TimeChangeFailure(FAILURE_MSG.format(command, hostname))

    def _has_chronyd(self, cmd: Connection) -> bool:
        try:
            ret_val = cmd.run("chronyd --help", hide=True)
            if ret_val.return_code == 0:
                return True
        except UnexpectedExit:
            pass
        return False

    def _has_ansible(self, cmd: Connection) -> bool:
        try:
            ret_val = cmd.run("ansible-playbook --help", hide=True)
            if ret_val.return_code == 0:
                return True
        except UnexpectedExit:
            pass
        return False

    def _set_clock_using_chronyd(self, cmd: Connection, hostname: str):
        cmd.run('systemctl stop chronyd')
        ret_val = cmd.run(self._chrony_burst_cmd)
        if ret_val.return_code != 0:
            raise TimeChangeFailure("Failed to run chronyd burst command on {}.".format(hostname))

        ret_val = cmd.run('systemctl start chronyd')
        if ret_val.return_code != 0:
            raise TimeChangeFailure("Failed to start chronyd service on {}".format(hostname))

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
            raise TimeChangeFailure(FAILURE_MSG_CTRL.format(command))

    def _set_ctrl_clock_using_chronyd(self):
        run_command2('systemctl stop chronyd')
        _, ret_val = run_command2(self._chrony_burst_cmd)
        if ret_val != 0:
            raise TimeChangeFailure("Failed to run chronyd burst command on ctrl.")

        _, ret_val = run_command2('systemctl start chronyd')
        if ret_val != 0:
            raise TimeChangeFailure("Failed to start chronyd service on ctrl.")

    def change_time_on_target(self,
                              cmd: Connection,
                              hostname: str,
                              is_master_server: bool) -> None:
        """
        Executes commands

        :param cmd: Fabric Connection
        :param hostname: The hostname of the node.
        :param is_master_server: True if this is the master server node which always runs timedatectl

        :return:
        """
        ret_val = cmd.run(self._timezone_cmd) # type: Result
        if ret_val.return_code != 0:
            raise TimeChangeFailure("Failed to run {} on {}".format(self._timezone_cmd, hostname))

        try:
            cmd.run(self._unset_ntp_cmd, warn=True)
        except UnexpectedExit:
            pass

        if is_master_server:
            self._set_clock_using_timedatectl(cmd, hostname)
        else:
            if self._has_chronyd(cmd):
                self._set_clock_using_chronyd(cmd, hostname)
            else:
                self._set_clock_using_timedatectl(cmd, hostname)

        ret_val = cmd.run(self._set_hwclock_cmd)
        if ret_val.return_code != 0:
                raise TimeChangeFailure(FAILURE_MSG.format(self._set_hwclock_cmd, hostname))

        cmd.run(self._set_ntp_cmd, warn=True)


    def set_controller_clock(self, use_timedatectl: bool):
        _, ret_val = run_command2(self._timezone_cmd)
        if ret_val != 0:
            raise TimeChangeFailure(FAILURE_MSG_CTRL.format(self._timezone_cmd))

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
            raise TimeChangeFailure(FAILURE_MSG_CTRL.format(self._set_hwclock_cmd))
        run_command2(self._set_ntp_cmd)


def _reorder_nodes_and_put_master_first(nodes: List[Dict]):
    node_cache = None
    index_cache = None

    for index, node in enumerate(nodes):
        if get_system_name() == "GIP":
            node['is_master_server'] = True
            is_master = True
            return

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
    time_form = payload['timeForm']
    _reorder_nodes_and_put_master_first(payload['kitForm']["nodes"])
    dt_srv = DatetimeService(time_form, payload['kitForm']["nodes"][0]["management_ip_address"])
    for node in payload['kitForm']["nodes"]:
        try:
            is_master = node['is_master_server']
        except KeyError:
            is_master = False

        with FabricConnectionManager('root', password, node["management_ip_address"]) as cmd:
            #if dt_srv._has_chronyd(cmd) or dt_srv._has_ansible(cmd):
            #    raise NodeDirtyException("{} is dirty.  Please rekickstart this node before proceeding.".format(node["hostname"]))
            dt_srv.change_time_on_target(cmd, node["hostname"], is_master)

    dt_srv.set_controller_clock(True)
    notify_clock_refresh()

def change_time_on_kit(time_form: Dict):
    kickstart = conn_mng.mongo_kickstart.find_one({"_id": KICKSTART_ID})
    kickstart['form']['timezone'] = time_form['timezone']
    conn_mng.mongo_kickstart.find_one_and_replace({"_id": KICKSTART_ID},
                                        {"_id": KICKSTART_ID, "form": kickstart["form"]},
                                        upsert=False,
                                        return_document=ReturnDocument.AFTER)
    kit = conn_mng.mongo_kit.find_one({"_id": KIT_ID})
    if kit and kickstart:
        if get_system_name() == "DIP":
            _reorder_nodes_and_put_master_first(kit['form']["nodes"])
        dt_srv = DatetimeService(time_form, kit['form']["nodes"][0]["management_ip_address"])
        password = decode_password(kickstart['form']['root_password'])
        for node in kit['form']["nodes"]:
            try:
                is_master = node['is_master_server']
            except KeyError:
                is_master = False

            with FabricConnectionManager('root', password, node["management_ip_address"]) as cmd:
                dt_srv.change_time_on_target(cmd, node["hostname"], is_master)

        dt_srv.set_controller_clock(False)
        notify_clock_refresh()
    else:
        raise TimeChangeFailure("Failed to change time as this kit has not been provisioned yet.")
