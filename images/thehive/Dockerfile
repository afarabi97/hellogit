FROM thehiveproject/thehive:3.4.0
USER root
RUN apt-get update && apt-get install python-pip -y && pip install requests && rm -rf /var/lib/apt/lists/*
USER daemon
ENTRYPOINT ["/opt/thehive/entrypoint"]
