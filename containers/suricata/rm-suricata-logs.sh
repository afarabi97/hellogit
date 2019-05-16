#!/bin/bash

/bin/find /var/log/suricata/ -mmin +10 -type f -iname "eve*" -delete
