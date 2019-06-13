FROM centos:7

RUN yum install -y gcc && \
    yum install -y python-devel && \
    yum install -y epel-release && \
    yum install -y python2-pip && \
    yum install -y krb5-devel krb5-workstation krb5-libs && \
    python -m pip install pywinrm && \
    python -m pip install pywinrm[kerberos] && \
    python -m pip install requests_kerberos && \
    python -m pip install kerberos && \
    yum install -y ansible && \
    mkdir /opt/tfplenum && \
    mkdir /opt/tfplenum/core && \
    mkdir /opt/tfplenum/core/playbooks

COPY roles /opt/tfplenum/core/playbooks/roles
COPY install_agents.yml /opt/tfplenum/core/playbooks/install_agents.yml