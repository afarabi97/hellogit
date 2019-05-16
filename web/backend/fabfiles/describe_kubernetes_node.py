"""
Main module used for saving any kubernetes information about nodes.
"""
import sys
from connection_wrappers import FabricConnectionWrapper


def describe_node(node_name: str):
    """
    Describes a node by its name.
    :param: node_name - The name of the node
    """
    with FabricConnectionWrapper() as fab_conn:
        fab_conn.run('kubectl describe node ' + node_name)

def main():
    if len(sys.argv) != 2:
        print("You must pass in the kubernetes node name.")
        exit(1)
        
    describe_node(sys.argv[1])


if __name__ == '__main__':
    main()
