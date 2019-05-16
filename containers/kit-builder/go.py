#!/usr/bin/env python3.6

import argparse
import subprocess
import sys

parser = argparse.ArgumentParser(add_help=False)

parser.add_argument('-du', '--di2e-username', dest='username')
parser.add_argument('-dp', '--di2e-password', dest='password')

args, unknown = parser.parse_known_args()


subprocess.run(['/usr/bin/cp', '-r', '/opt/tfplenum-integration-testing', '/opt/tfplenum-integration-testing~'])
subprocess.run(['/usr/bin/rm', '-rf', '/opt/tfplenum-integration-testing'])
subprocess.run(['/usr/bin/git', 'clone', '--single-branch', '--branch', 'devel', 'https://%s:%s@bitbucket.di2e.net/scm/thisiscvah/tfplenum-integration-testing.git' % (args.username, args.password), '/opt/tfplenum-integration-testing'])
subprocess.run(['/usr/bin/cp', '-rT', '/opt/tfplenum-integration-testing~', '/opt/tfplenum-integration-testing'])
#subprocess.run(['/opt/tfplenum-integration-testing/testy-tester/setup.sh'])

subprocess.run('/opt/tfplenum-integration-testing/testy-tester/tfp-env/bin/python /opt/tfplenum-integration-testing/testy-tester/main.py --headless "'+'" "'.join(sys.argv[1:])+'"', shell=True)
