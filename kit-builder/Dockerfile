FROM centos:7
MAINTAINER Brett Smith <brett.smith@salientcrgt.com>
WORKDIR /opt

RUN yum install -y yum install openssl-devel && yum clean all

COPY setup.sh /opt/tfplenum-integration-testing/testy-tester/setup.sh
COPY requirements.txt /opt/tfplenum-integration-testing/testy-tester/requirements.txt
RUN chmod +x /opt/tfplenum-integration-testing/testy-tester/setup.sh && /opt/tfplenum-integration-testing/testy-tester/setup.sh

COPY ./go.py /opt
RUN chmod +x /opt/go.py

ENTRYPOINT ["/opt/go.py"]
CMD ["--help"]
