#1/bin/bash

/usr/share/filebeat/bin/filebeat -c /etc/filebeat/filebeat.yml -path.home /usr/share/filebeat -path.config /etc/filebeat -path.data /var/lib/filebeat -path.logs /var/log/filebeat &

/usr/sbin/suricata -c /etc/suricata/suricata.yaml --af-packet