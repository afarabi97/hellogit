"""
Main module used for saving any kubernetes information that the main frontend requires
for rendering pages.
"""
import sys
from connection_wrappers import FabricConnectionWrapper


def pod_logs(pod_name: str, namespace: str, container_name: str):
    """
    Describes a pod by its name.
    """
    with FabricConnectionWrapper() as fab_conn:
        fab_conn.run('kubectl logs ' + pod_name + ' -n ' + namespace + ' -c ' + container_name)

def main():
    if len(sys.argv) != 4:
        print("You must pass in the kubernetes pod name.")
        exit(1)

    pod_logs(sys.argv[1], sys.argv[2], sys.argv[3])


if __name__ == '__main__':
    main()
