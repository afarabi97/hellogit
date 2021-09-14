FROM registry.access.redhat.com/ubi8/ubi:8.2

ARG YUM_REPO

RUN echo "$YUM_REPO" > /etc/resolv.conf && \
    curl -o /etc/yum.repos.d/labrepo-server-rhel.repo http://yum.labrepo.sil.lab/rhel8/labrepo-server-rhel8.repo && \
    curl -O -L https://download.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm && \
    dnf install epel-release-latest-8.noarch.rpm -y && \
    rm -rf epel-release-latest-8.noarch.rpm && \
    dnf install yum-utils -y && \
    yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo && \
    dnf install rpmdevtools python3 gcc krb5-devel  p7zip p7zip-plugins createrepo docker-ce -y && \
    rm -rf /etc/yum.repos.d/labrepo-server-rhel.repo && \
    pip3 install --upgrade pip && \
    pip3 install --no-cache-dir cryptography==2.9.2 && \
    pip3 install --no-cache-dir ansible==2.10.4 && \
    pip3 install --no-cache-dir pip2pi==0.8.1 && \
    pip3 install --no-cache-dir requests==2.26.0 && \
    dnf clean all && \
    curl -O https://get.helm.sh/helm-v3.7.0-rc.2-linux-amd64.tar.gz && \
    tar --strip-components=1  -xvf helm-v3.7.0-rc.2-linux-amd64.tar.gz -C /usr/local/bin/ && \
    rm -rf helm-v3.7.0-rc.2-linux-amd64.tar.gz && \
    curl -k -o /etc/pki/ca-trust/source/anchors/sil.lab.crt https://nexus.sil.lab/repository/tfplenum-repo/certs/sil.lab.crt && \
    /usr/bin/update-ca-trust
