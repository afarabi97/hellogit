FROM registry.access.redhat.com/ubi8-minimal

RUN microdnf install python3 && \
    microdnf clean all && \
    pip3 install --upgrade restresponse elasticsearch urllib3 requests

ADD ./app.py ./template.json /

ENTRYPOINT ["/app.py"]
