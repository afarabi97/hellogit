from components.controller import check_controller_services
from components.kube import check_kubernetes
from components.elastic import check_elastic
from components.metrics import check_node_metrics
from datetime import date
import os
from git import Repo

def get_commit_hash() -> str:
    REPO_PATH = "/opt/tfplenum"
    repo = Repo(REPO_PATH)
    sha = repo.head.commit.hexsha
    short_sha = repo.git.rev_parse(sha, short=8)
    return short_sha

def collect_logs():
    commit_hash = get_commit_hash()
    path = "/var/log"
    tar_name = "tfplenum-logs-{}-{}.tar".format(date.today(), commit_hash)
    command = "tar -cf  {}/{} {} > /dev/null 2>&1".format(path, tar_name, path)
    os.system(command)
    print("=====> {} created in /var/log".format(tar_name))

def start_diagnostic():
    check_controller_services()
    kube = check_kubernetes()
    check_node_metrics(kube)
    check_elastic(kube)
    collect_logs()

if __name__ == '__main__':
    start_diagnostic()
