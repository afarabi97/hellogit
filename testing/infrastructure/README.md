For labrepo.sh, you must install it on a RHEL 7 server. For all other scripts, install on Centos 7.

To install infrastructure do the following:

cd /opt/tfplenum/testing
scp -r infrastructure/ root@<ip of target>:/root

ssh root@<ip of target>
cd /root/
./labrepo.sh
or
./jenkins_worker.sh
