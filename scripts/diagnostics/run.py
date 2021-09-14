from components.controller import check_controller_services
from components.kube import check_kubernetes
from components.elastic import check_elastic
from components.metrics import check_node_metrics
from datetime import date
import os
import time
from git import Repo

def get_commit_hash() -> str:
    REPO_PATH = "/opt/tfplenum"
    repo = Repo(REPO_PATH)
    sha = repo.head.commit.hexsha
    short_sha = repo.git.rev_parse(sha, short=8)
    return short_sha

def collect_logs():
    tar_name = "tfplenum-logs-{}-{}.tar".format(date.today(), get_commit_hash())
    os.system("mkdir -p /var/www/html/downloads > /dev/null 2>&1")
    os.system(f"tar -cf /var/www/html/downloads/{tar_name} -C /var/log . > /dev/null 2>&1")
    print("=====> {} created in /var/www/html/downloads".format(tar_name))

def start_diagnostic():
    check_controller_services()
    kube = check_kubernetes()
    check_node_metrics(kube)
    check_elastic(kube)
    collect_logs()

if __name__ == '__main__':
    start_diagnostic()
