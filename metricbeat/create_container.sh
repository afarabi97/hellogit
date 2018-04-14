#!/bin/bash

yum install -y git go

go get k8s.io/kube-state-metrics

cd ../go/src/k8s.io/kube-state-metrics

make container

docker login

docker tag quay.io/coreos/kube-state-metrics-amd64:v1.3.0 tfplenum/kube-state-metrics-amd64:v1.3.0

docker push tfplenum/kube-state-metrics-amd64:v1.3.0

docker tag quay.io/coreos/kube-state-metrics:v1.3.0 tfplenum/kube-state-metrics:v1.3.0

docker push tfplenum/kube-state-metrics:v1.3.0

kubectl apply -f kubernetes
