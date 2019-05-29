FROM ubuntu:14.04

RUN apt-get update \
&& apt-get upgrade -y \
&& apt-get install -y mumble-server sudo \
&& apt-get install -y supervisor \
&& mkdir -p /var/log/supervisor

ADD supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN useradd -m -p admin -r -s /bin/bash -g root admin \
&& echo "admin:admin" | chpasswd \
&& sudo adduser admin sudo

EXPOSE 64738

CMD ["/usr/bin/supervisord"]

RUN /usr/sbin/murmurd -fg -ini /etc/mumble-server.ini -supw admin