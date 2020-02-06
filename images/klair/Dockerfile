FROM registry.gitlab.com/gitlab-org/security-products/analyzers/klar:2
COPY gitlab.registry.sil.lab.pem /etc/ssl/certs/gitlab.registry.sil.lab.pem
RUN cat /etc/ssl/certs/gitlab.registry.sil.lab.pem >> /etc/ssl/certs/ca-certificates.crt
