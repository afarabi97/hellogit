FROM alpine
COPY ./component-builder/pipeline-images/vommit/files/* /root/
COPY ./component-builder/pipeline-images/vommit/rules/commit_rules.py /root/rules/commit_rules.py
RUN apk add --no-cache git git-lfs py3-pip && \
    pip3 install gitlint && \
    git config --global --add safe.directory /repo
WORKDIR /repo
ENTRYPOINT ["gitlint"]
