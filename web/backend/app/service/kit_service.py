from app import celery, logger, CORE_DIR, conn_mng
from app.inventory_generator import KitInventoryGenerator
from app.service.socket_service import NotificationMessage, NotificationCode
from app.service.job_service import AsyncJob
from pathlib import Path
from shared.constants import KICKSTART_ID, KIT_ID


_JOB_NAME = "kit"


def _remove_node_inventory_section():
    current_kit_configuration = conn_mng.mongo_kit.find_one({"_id": KIT_ID})
    current_kickstart_config = conn_mng.mongo_kickstart.find_one({"_id": KICKSTART_ID})

    if current_kit_configuration["form"] and current_kit_configuration["form"]["remove_node"]:
        del current_kit_configuration["form"]["remove_node"]
        kit_generator = KitInventoryGenerator(current_kit_configuration["form"], current_kickstart_config["form"])
        kit_generator.generate()
        conn_mng.mongo_kit.find_one_and_replace({"_id": KIT_ID}, {"_id": KIT_ID, "form": current_kit_configuration["form"]})


@celery.task
def perform_kit(command: str, is_remove_node:bool=False):
    notification = NotificationMessage(role=_JOB_NAME)
    notification.setMessage("%s started." % _JOB_NAME.capitalize())
    notification.setStatus(NotificationCode.STARTED.name)
    notification.post_to_websocket_api()

    cwd_dir = str(CORE_DIR / "playbooks")
    job = AsyncJob(_JOB_NAME.capitalize(), command, working_dir=cwd_dir)

    notification.setMessage("%s in progress." % _JOB_NAME.capitalize())
    notification.setStatus(NotificationCode.IN_PROGRESS.name)
    notification.post_to_websocket_api()

    ret_val = job.run_asycn_command()
    msg = "%s job successfully completed." % _JOB_NAME.capitalize()
    if ret_val != 0:
        msg = "%s job failed." % _JOB_NAME.capitalize()
        notification.setMessage(msg)
        notification.setStatus(NotificationCode.ERROR.name)
        notification.post_to_websocket_api()
    else:
        notification.setMessage(msg)
        notification.setStatus(NotificationCode.COMPLETED.name)
        notification.post_to_websocket_api()
    conn_mng.mongo_celery_tasks.delete_one({"_id": _JOB_NAME.capitalize()})

    if is_remove_node:
        _remove_node_inventory_section()

    return ret_val
