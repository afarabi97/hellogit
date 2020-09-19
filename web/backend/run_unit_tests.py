import coverage
import os
import unittest

os.environ['IS_DEBUG_SERVER'] = "yes"

from app.service.job_service import run_command2
from app.tests.ruleset_tests import TestRulesetController
from app.tests.pcap_tests import TestPcapController
from app.tests.cold_log_tests import TestColdLogController
from app.tests.kickstart_tests import KickstartTests
from app.tests.mip_kickstart_tests import MIPKickstartTests
from app.tests.dip_kit_tests import KitTests


def run_tests() -> bool:
    # test_classes_to_run = [KickstartTests, TestPcapController, TestRulesetController, TestColdLogController, MIPKickstartTests]
    """
    TODO Add this to boostrap to fix ColLogIngest stuff.

    systemctl start firewalld.service
    firewall-cmd --zone=trusted --change-interface=docker0 --permanent
    firewall-cmd --zone=trusted --add-masquerade --permanent
    firewall-cmd --reload
    systemctl restart docker
    """
    test_classes_to_run = [KickstartTests, TestPcapController, TestRulesetController, MIPKickstartTests]
    # test_classes_to_run = [KitTests]
    loader = unittest.TestLoader()
    suites_list = []
    for test_class in test_classes_to_run:
        suite = loader.loadTestsFromTestCase(test_class)
        suites_list.append(suite)

    big_suite = unittest.TestSuite(suites_list)

    runner = unittest.TextTestRunner()
    results = runner.run(big_suite)
    if len(results.failures) > 0 or len(results.errors) > 0:
        exit(1)


def main():
    backup_file_name = "unittest_backup.tar.gz"
    _, ret_val = run_command2("/opt/tfplenum/web/setup/backup_tfplenum.sh {}".format(backup_file_name))
    if ret_val != 0:
        print("Failed to backup the database. Exiting")
        exit(1)

    try:
        run_tests()
    finally:
        _, ret_val = run_command2("/opt/tfplenum/web/setup/restore_tfplenum.sh {}".format(backup_file_name))
        if ret_val != 0:
            print("Failed to restore the database. Exiting.")
            exit(1)


if __name__ == '__main__':
    main()
