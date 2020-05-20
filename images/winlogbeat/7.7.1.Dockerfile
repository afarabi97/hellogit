FROM golang:1.13 as builder
ARG version=7.7.1

# Install virtualenv. Required for beats build processes.
RUN apt-get update
RUN apt-get install -y python3 python3-venv

#RUN go get github.com/elastic/beats
RUN mkdir -p $GOPATH/src/github.com/elastic
RUN git -C $GOPATH/src/github.com/elastic clone --depth 1 --single-branch --branch v${version} https://github.com/elastic/beats
WORKDIR $GOPATH/src/github.com/elastic/beats

# Target winlogbeat
WORKDIR $GOPATH/src/github.com/elastic/beats/winlogbeat

# Patch out the `init` function in winlogbeat to avoid this error on non-Windows systems:
#   Exiting: Failed to create new event log. No event log API is available on this system
#
# This allows us to run `winlogbeat setup` on linux systems.
RUN sed -i -e 's/^\(func .* \)\(init(.*) error {.*\)$/\1\2 return nil }\n\1_\2/' beater/winlogbeat.go

# Compile winlogbeat
RUN make

# Generate winlogbeat's dashboards/templates/fields/etc
RUN make update

# FINAL winlogbeat image
FROM registry.access.redhat.com/ubi8-minimal
COPY --from=builder /go/src/github.com/elastic/beats/winlogbeat/* /usr/local/
ENTRYPOINT ["/usr/local/winlogbeat"]
