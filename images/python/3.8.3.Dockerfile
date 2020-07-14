FROM python:3.8.3-alpine3.12

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN apk update && apk add openjdk8 && rm -rf /var/cache/apk/*
