FROM ubuntu:focal

#User Input
ARG MISP_VERSION=2.4.132
ARG MISP_TAG=v${MISP_VERSION}

# Install core components
ENV DEBIAN_FRONTEND noninteractive
ENV LANG en_US.UTF-8

# Apache and PHP 7.4 and install MySQL PDO extension
RUN apt-get update && apt-get dist-upgrade -y && apt-get install -y --no-install-recommends \
    apache2 apache2-doc apache2-utils libapache2-mod-shib libapache2-mod-auth-openidc libapache2-mod-php php php-dev php-json php-zip php-intl \
    php-mysql php-redis php-xml php-mbstring php-gd php-pear php-opcache pkg-config libbson-1.0 libmongoc-1.0-0 \
    python3-dev python3-pip libjpeg-dev libxml2-dev libxslt1-dev zlib1g-dev libfuzzy-dev cron logrotate supervisor syslog-ng-core \
    software-properties-common postfix mysql-client curl gcc git gnupg-agent make python openssl redis-server sudo vim zip locales \
    libpoppler97 libpoppler-dev libpoppler-cpp-dev && apt-get clean && apt-get autoremove -y && rm -rf /var/lib/apt/lists/* && \
    a2dismod status && a2dissite 000-default && locale-gen en_US.UTF-8

# Fix php.ini with recommended settings
RUN sed -i \
        -e "s/max_execution_time = 30/max_execution_time = 300/" \
        -e "s/memory_limit = 128M/memory_limit = 2048M/" \
        -e "s/upload_max_filesize = 2M/upload_max_filesize = 50M/" \
        -e "s/post_max_size = 8M/post_max_size = 50M/" \
        /etc/php/7.4/apache2/php.ini

WORKDIR /var/www
RUN chown www-data:www-data /var/www
USER www-data
RUN git clone https://github.com/MISP/MISP.git
WORKDIR /var/www/MISP
RUN git checkout tags/${MISP_TAG} && \
    git config core.filemode false && \
    git submodule update --init --recursive && \
    git submodule foreach --recursive git config core.filemode false

USER root
RUN pip3 install git+https://github.com/STIXProject/python-stix.git \
                 git+https://github.com/CybOXProject/python-cybox.git \
                 git+https://github.com/CybOXProject/mixbox.git \
                 git+https://github.com/MAECProject/python-maec.git \
                 git+https://github.com/kbandla/pydeep.git \
                 /var/www/MISP/cti-python-stix2 \
                 /var/www/MISP/PyMISP \
                 plyara python-magic setuptools lxml lief --upgrade

USER www-data
WORKDIR /var/www/MISP
RUN git submodule init && git submodule update
WORKDIR /var/www/MISP/app

# FIX COMPOSER
RUN curl --fail --location -o composer-setup.php https://getcomposer.org/installer && \
#    EXPECTED_SIGNATURE="$(curl https://composer.github.io/installer.sig)"; php -r "if (hash_file('sha384', 'composer-setup.php') == '$(echo $EXPECTED_SIGNATURE)' ) { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;" && \
    php composer-setup.php && \
    php -r "unlink('composer-setup.php');"
# END FIX

RUN php composer.phar update && \
    php composer.phar config vendor-dir Vendor && \
    php composer.phar install --ignore-platform-reqs
USER root
RUN phpenmod redis
USER www-data
RUN cp -fa /var/www/MISP/INSTALL/setup/config.php /var/www/MISP/app/Plugin/CakeResque/Config/config.php

# Fix permissions
USER root
RUN chown -R www-data:www-data /var/www/MISP && \
    chmod -R 750 /var/www/MISP && \
    chmod -R g+ws /var/www/MISP/app/tmp && \
    chmod -R g+ws /var/www/MISP/app/files && \
    chmod -R g+ws /var/www/MISP/app/files/scripts/tmp && \
    chmod +x /var/www/MISP/app/Console/cake

RUN cp /var/www/MISP/INSTALL/misp.logrotate /etc/logrotate.d/misp

# Preconfigure setting for packages
RUN echo "postfix postfix/main_mailer_type string Local only" \
  | debconf-set-selections && \
    echo "postfix postfix/mailname string localhost.localdomain" | \
    debconf-set-selections

# Redis Setup
RUN sed -i 's/^\(daemonize\s*\)yes\s*$/\1no/g' /etc/redis/redis.conf
RUN sed -i 's/^\(bind\s*\)127.0.0.1 ::1\s*$/\1127.0.0.1/g' /etc/redis/redis.conf

# Add a healthcheck endpoint
# COPY healthcheck.patch healthcheck.patch
# RUN patch /var/www/MISP/INSTALL/apache.misp.ubuntu < healthcheck.patch

# Apache Setup
RUN cp /var/www/MISP/INSTALL/apache.misp.ubuntu /etc/apache2/sites-available/misp.conf && \
    a2dissite 000-default && \
    a2ensite misp && \
    a2enmod rewrite && \
    a2enmod headers && \
    a2enmod ssl && \
    a2enmod shib && \
    a2enmod auth_openidc

USER www-data
# MISP base configuration
RUN cp -a /var/www/MISP/app/Config/bootstrap.default.php /var/www/MISP/app/Config/bootstrap.php && \
    cp -a /var/www/MISP/app/Config/database.default.php /var/www/MISP/app/Config/database.php && \
    cp -a /var/www/MISP/app/Config/core.default.php /var/www/MISP/app/Config/core.php && \
    cp -a /var/www/MISP/app/Config/config.default.php /var/www/MISP/app/Config/config.php && \
    chown -R www-data:www-data /var/www/MISP/app/Config && \
    chmod -R 750 /var/www/MISP/app/Config

USER root
# Replace the default salt
RUN sed -i -E "s/'salt'\s=>\s'(\S+)'/'salt' => '`openssl rand -base64 32|tr "/" "-"`'/" /var/www/MISP/app/Config/config.php

# Enable workers at boot time
RUN chmod a+x /var/www/MISP/app/Console/worker/start.sh && \
    echo "sudo -u www-data bash /var/www/MISP/app/Console/worker/start.sh" >>/etc/rc.local

# Install templates & stuff
WORKDIR /var/www/MISP/app/files
RUN rm -rf misp-objects && git clone https://github.com/MISP/misp-objects.git && \
    rm -rf misp-galaxy && git clone https://github.com/MISP/misp-galaxy.git && \
    rm -rf warninglists && git clone https://github.com/MISP/misp-warninglists.git ./warninglists && \
    rm -rf taxonomies && git clone https://github.com/MISP/misp-taxonomies.git ./taxonomies && \
    chown -R www-data:www-data misp-objects misp-galaxy warninglists taxonomies

# Supervisord Setup
RUN ( \
    echo '[supervisord]'; \
    echo 'nodaemon = true'; \
    echo 'user = root'; \
    echo ''; \
    echo '[program:postfix]'; \
    echo 'process_name = master'; \
    echo 'directory = /etc/postfix'; \
    echo 'command = /usr/sbin/postfix -c /etc/postfix start'; \
    echo 'startsecs = 0'; \
    echo 'autorestart = false'; \
    echo ''; \
    echo '[program:redis-server]'; \
    echo 'command=redis-server /etc/redis/redis.conf'; \
    echo ''; \
    echo '[program:apache2]'; \
    echo 'command=/bin/bash -c "source /etc/apache2/envvars && exec /usr/sbin/apache2 -D FOREGROUND"'; \
    echo ''; \
    echo '[program:resque]'; \
    echo 'command=/bin/bash /var/www/MISP/app/Console/worker/start.sh'; \
    echo 'user = www-data'; \
    echo 'startsecs = 0'; \
    echo 'autorestart = false'; \
) >> /etc/supervisor/conf.d/supervisord.conf

# Modify syslog configuration
RUN sed -i -E 's/^(\s*)system\(\);/\1unix-stream("\/dev\/log");/' /etc/syslog-ng/syslog-ng.conf

# Add run script
# Trigger to perform first boot operations
COPY ${MISP_VERSION}.run.sh /run.sh
RUN chmod 0755 /run.sh && touch /.firstboot.tmp

# Make a backup of /var/www/MISP to restore it to the local moint point at first boot
WORKDIR /var/www/MISP/app/Config
RUN tar czpf /root/MISPconfig.tgz .

VOLUME /var/www/MISP/app/Config
EXPOSE 80
ENTRYPOINT ["/run.sh"]
