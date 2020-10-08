FROM python:3.9.0-alpine3.12

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN apk update && apk add openjdk8 && rm -rf /var/cache/apk/*
