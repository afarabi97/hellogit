from util.ssh import wait_for_connection
from util.ansible_util import execute_playbook, Target
from util.connection_mngs import FabricConnectionWrapper
from util.constants import MINIO_PREFIX, PIPELINE_DIR, MINIO_DIR, SKIP_MINIO_BUILD_AND_TEMPLATE
from models.minio import MinIOSettings
from util.vmware_util import get_vms_in_folder


MINIO_PLAYBOOK = MINIO_DIR + 'minio.yml'
CLONE_MINIO = PIPELINE_DIR + 'playbooks/clone_minio.yml'


class StandAloneMinIO:
    def __init__(self, settings: MinIOSettings):
        self.settings = settings

    def _is_built_already(self) -> bool:
        commit_hash = self.settings.commit_hash
        vms = get_vms_in_folder("Releases", self.settings.vcenter)
        for vm_name in vms:
            if MINIO_PREFIX in vm_name and commit_hash in vm_name:
                return True
        return False

    def create(self):
        if self.settings.pipeline == "export-all" and self._is_built_already():
            print("The Minio template is already built. Skipping")
            # This file is created and saved in pipeline artifacts so that export stage can check to see if we need to recreate the template or not.
            with open(SKIP_MINIO_BUILD_AND_TEMPLATE, 'w') as f:
                pass
        else:
            execute_playbook([CLONE_MINIO], self.settings.to_dict())
            wait_for_connection(self.settings.ip, 22, 30)
            with FabricConnectionWrapper("root", self.settings.password, self.settings.ip) as remote_shell:
                remote_shell.run('pvcreate /dev/sdb; vgextend rhel /dev/sdb; lvextend -l  +100%PVS /dev/rhel/root /dev/sdb; xfs_growfs /')
            execute_playbook([MINIO_PLAYBOOK],
                            extra_vars={'ansible_user': 'root', 'ansible_password': self.settings.password, **self.settings.to_dict()},
                            targets=Target("minio", self.settings.ip),
                            tags=['install'],
                            timeout=300)
