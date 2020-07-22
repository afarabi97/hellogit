FROM centos:7

COPY ./ /opt/tfplenum

RUN yum -y install centos-release-ansible-29 && \
    yum -y install ansible make python36 python36-devel gcc krb5-workstation krb5-devel && \
    cd /opt/tfplenum/bootstrap/playbooks && \
    ansible-playbook site.yml -i localhost -e 'system_name=DIP' -t install_node && \
    cd /opt && \
    rm -rf tfplenum/
