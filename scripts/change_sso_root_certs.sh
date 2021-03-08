#!/bin/bash
if [ "$EUID" -ne 0 ]
  then echo "Please run as root or use sudo."
  exit
fi

function fatal_error {
        printf "Error: %s\n"  "$*" >>/dev/stderr
        exit 1
}

function run_cmd {
    local command="$@"
    eval "$command"
    local ret_val=$?
    if [ $ret_val -ne 0 ]; then
        fatal_error "$command returned error code $ret_val"
    fi
}

# Run pre-checks
if [ -z "$1" ]
then
        fatal_error "Usage: $0 <cardtype> \
                cardtype  Set card type to reflect mission environment:  either NMIL or SMIL"
fi

# Check for existence of dod_root.pem
if [ ! -e "/etc/httpd/conf.d/dod_root.pem" ]
then
        touch /etc/httpd/conf.d/dod_root.pem
fi

CARDTYPE=$1
if [ "$CARDTYPE" != "NMIL" ] && [ "$CARDTYPE" != "SMIL" ]
then
        fatal_error "Incorrect cardtype selected. Please select 'NMIL' or 'SMIL'"
fi

if [ "$CARDTYPE" == "NMIL" ]
then
        file=$(find /opt/tfplenum/scripts/dod_certs/ -iname *DOD*.pem)
elif [ "$CARDTYPE" == "SMIL" ]
then
        file=$(find /opt/tfplenum/scripts/dod_certs/ -iname *SIPR*.pem)
fi

if [ ! -e "$file" ]
then
        fatal_error "$file not found!"
fi

if [ "$(expr "${file,,}" : '.*\(.pem\).*')" == ".pem" ]
then
        FORMAT="PEM"
else
        fatal_error "Doh! Input file $file doesn't contain a .pem' string!"
fi

printf "Certificate store format is %s\n" "$FORMAT"

printf "Backing Up Old Bundle File\n"
CURRENT_TIME=$(date "+%Y.%m.%d-%H.%M.%S")
run_cmd cp /etc/httpd/conf.d/dod_root.pem /etc/httpd/conf.d/dod_root.pem."$CURRENT_TIME"

printf "Copying %s certs over\n" "$CARDTYPE"
cp "$file" /etc/httpd/conf.d/dod_root.pem

printf "Restarting httpd service\n"
run_cmd service httpd restart

printf  "%s certs are now applied\n" "$CARDTYPE"
