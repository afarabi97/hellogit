#!/opt/tfplenum/.venv/bin/python3
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
AGENT_PKGS_DIR = SCRIPT_DIR + '/../agent_pkgs/'

sys.path.append(SCRIPT_DIR + "/../web/backend/")
from app.utils.connection_mngs import KubernetesSecret, get_kubernetes_certifcate_secret
from app.service.job_service import run_command2
from pathlib import Path


def retrieve_certificate(certificate_name: str):
    secret = get_kubernetes_certifcate_secret(certificate_name) # type: KubernetesSecret
    folder = Path(SCRIPT_DIR + "/" + certificate_name)
    folder.mkdir(exist_ok=True)
    if secret:
        secret.write_to_file(str(folder))
        print("Certificate saved to {}".format(str(folder)))
    else:
        print("Unable to get {} secret".format(certificate_name))
        exit(1)

def apply_certificate(script: str):
    stdout, ret_val = run_command2("kubectl apply -f {}".format(script))
    if ret_val != 0:
        print("Failed to run kubectl apply command with error code {} and {}".format(ret_val, stdout))
        exit(1)


def main():
    for path in Path(AGENT_PKGS_DIR).glob("*"): # type: Path
        if path.is_dir():
            certificate = path / "kubernetes/certificate.yml"
            application = path
            if certificate.is_file():
                apply_certificate(str(certificate))
                retrieve_certificate("{}-agent-certificate".format(application.name))


if __name__ == '__main__':
    main()
