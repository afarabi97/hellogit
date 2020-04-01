import json
import traceback

from app import celery
from app.service.socket_service import NotificationMessage, NotificationCode
from typing import Dict, List
from shared.connection_mngs import FabricConnectionManager
from shared.constants import PCAP_UPLOAD_DIR
from pathlib import Path


class ReplayObject:
    def __init__(self, payload: Dict):
        self.pcap = payload['pcap'] # type: str
        self.sensor = payload['sensor'] # type: str
        self.ifaces = payload['ifaces'] # type: List[str]


@celery.task
def replay_pcap_srv(payload: Dict, root_password: str):
    replay = ReplayObject(payload)
    notification = NotificationMessage(role="pcap")
    notification.set_status(status=NotificationCode.STARTED.name)
    notification.set_message("{} replay started.".format(replay.pcap))
    notification.post_to_websocket_api()

    try:
        pcap_file = Path(PCAP_UPLOAD_DIR + "/" + replay.pcap)
        if not pcap_file.exists() or not pcap_file.is_file():
            notification.set_status(status=NotificationCode.ERROR.name)
            notification.set_message("{} does not exist or is not a file.".format(str(pcap_file)))
            notification.post_to_websocket_api()

        with FabricConnectionManager('root', root_password, payload['sensor']) as ssh_con:
            remote_pcap = "/tmp/{}".format(replay.pcap)
            ssh_con.put(str(pcap_file), remote_pcap)
            for iface in replay.ifaces:
                ssh_con.run("tcpreplay --mbps=100 -i {} {}".format(iface, remote_pcap))
            ssh_con.run("rm -f {}".format(remote_pcap))

        notification.set_status(status=NotificationCode.COMPLETED.name)
        notification.set_message("Completed tcpreplay of {}.".format(replay.pcap))
        notification.post_to_websocket_api()
    except Exception as e:
        traceback.print_exc()
        notification.set_status(status=NotificationCode.ERROR.name)
        notification.set_message(str(e))
        notification.post_to_websocket_api()
