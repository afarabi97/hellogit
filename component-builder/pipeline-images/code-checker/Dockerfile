FROM centos:centos8

RUN sed -i 's/mirrorlist/#mirrorlist/g' /etc/yum.repos.d/CentOS-Linux-* && sed -i 's|#baseurl=http://mirror.centos.org|baseurl=http://vault.centos.org|g' /etc/yum.repos.d/CentOS-Linux-*
RUN yum -y update && yum -y groupinstall "Development Tools" && yum -y update && \
    yum -y install centos-release-ansible-29 epel-release wget gtk3 krb5-workstation krb5-devel openssl-devel libffi-devel bzip2-devel && \
    yum -y update && yum -y install ansible python36
RUN yum -y update && yum install -y platform-python-devel

RUN wget --no-check-certificate https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm -P /usr/local && \
    yum install -y /usr/local/google-chrome-stable_current_*.rpm && \
    wget --no-check-certificate http://ftp.mozilla.org/pub/firefox/releases/76.0/linux-x86_64/en-US/firefox-76.0.tar.bz2 -P /usr/local && \
    tar -xvjf /usr/local/firefox-76.0.tar.bz2 -C /usr/local && \
    ln -s /usr/local/firefox/firefox /usr/bin/firefox

COPY ./requirements.txt /opt/tfplenum/requirements.txt
RUN pip3 install --user --no-cache-dir --upgrade pip && pip3 install --user --no-cache-dir wheel && ANSIBLE_SKIP_CONFLICT_CHECK=1 pip3 install --user --no-cache-dir -r /opt/tfplenum/requirements.txt
RUN pip3 install --user --upgrade --no-cache-dir pytest pylint pytest-cov pytest-bdd pytest-splinter pytest-mock unittest2 urllib3 coverage

COPY ./ /opt/tfplenum
WORKDIR /opt/tfplenum/bootstrap/playbooks
RUN ansible-playbook site.yml -i localhost -t install_node

# Cleanup:
WORKDIR /opt
RUN rm -rf tfplenum/

# Remove yum packages
RUN yum autoremove -y bzip2 epel-release ansible centos-release-ansible-29

# Remove Chrome and Firefox packages
RUN rm -rf /usr/local/google-chrome-stable_current_x86_64.rpm && \
    rm -rf /usr/local/firefox-76.0.tar.bz2

RUN echo PATH=$PATH:$HOME/.local/bin | tee -a $HOME/.bash_profile $HOME/.bashrc && source ~/.bashrc
ENV PATH $PATH:/root/.local/bin
