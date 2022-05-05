FROM python:3.10

RUN apt-get install -y git curl

COPY ./component-builder/pipeline-images/vommit/files/* /root/
RUN pip3 install --ignore-requires-python install --no-cache-dir -r /root/requirements.txt
COPY ./component-builder/pipeline-images/vommit/rules/commit_rules.py /root/rules/commit_rules.py
WORKDIR /repo
CMD [ "/usr/bin/bash", "-c" ]
