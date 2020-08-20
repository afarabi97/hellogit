FROM centos:7

COPY ./ /opt/tfplenum

RUN yum -y install centos-release-ansible-29 epel-release && \
    yum -y install ansible make python36 python36-devel python-pip python-wheel wget bzip2 gtk3 \
    libXt gcc krb5-workstation krb5-devel && \
    pushd /opt/tfplenum/bootstrap/playbooks && \
    ansible-playbook site.yml -i localhost -e 'system_name=DIP' -t install_node && \
    # Download, Install Google-Chrome-Stable:
    popd > /dev/null && \
    wget https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm -P /usr/local && \
    yum install -y /usr/local/google-chrome-stable_current_*.rpm && \
    # Download,Install Firefox 76:
    wget -P /usr/local  http://ftp.mozilla.org/pub/firefox/releases/76.0/linux-x86_64/en-US/firefox-76.0.tar.bz2 && \
    tar -xvjf /usr/local/firefox-76.0.tar.bz2 -C /usr/local && \
    ln -s /usr/local/firefox/firefox /usr/bin/firefox && \
    # Install python required packages:
    curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py && \
    python get-pip.py && \
    pip install --upgrade pip && \
    pip3 install -r /opt/tfplenum/testing/pipeline/requirements-centos7.txt --exists-action=i && \
    pip3 install pytest --exists-action=i && \
    pip3 install pylint==2.5.3 --exists-action=i && \
    pip3 install pytest-cov && \
    pip3 install unittest2 && \
    pip3 install coverage && \
    # Cleanup:
    cd /opt && \
    rm -rf tfplenum/ && \
    yum autoremove -y bzip2 epel-release ansible centos-release-ansible-29 && \
    rm -rf /usr/local/google-chrome-stable_current_x86_64.rpm && \
    rm -rf /usr/local/firefox-76.0.tar.bz2
