#!/bin/bash

#setup cron job to clear logs every 30 minutes
echo "*/30 * * * * /opt/zeek/bin/zeekctl cron" > /var/spool/cron/root

#start crond in background
crond -n&

#deploy zeekctl cluster
/opt/zeek/bin/zeekctl deploy

#container will sleep for infity and wait
sleep infinity& wait; kill $!
