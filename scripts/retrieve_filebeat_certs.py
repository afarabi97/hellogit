#!/opt/tfplenum/web/tfp-env/bin/python
import os
import sys
sys.path.append("/opt/tfplenum/web/backend/")

from shared.connection_mngs import get_kubernetes_secret, MongoConnectionManager, KubernetesSecret
from app.service.job_service import run_command2

SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))


def main():
    script = "/opt/tfplenum/agent_pkgs/filebeat/kubernetes/certificate.yml"
    stdout, ret_val = run_command2("kubectl apply -f {}".format(script))
    if ret_val != 0:
        print("Failed to run kubectl apply command with error code {} and {}".format(ret_val, stdout))
        exit(1)

    conn_mng = MongoConnectionManager()
    secret = get_kubernetes_secret(conn_mng, "filebeat-certificate")
    secret.write_to_file(SCRIPT_DIR)
    print("Scripts saved to {}".format(SCRIPT_DIR))


if __name__ == '__main__':
    main()
