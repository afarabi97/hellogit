#!/bin/bash

Date="`date +%Y%m%d%H%M%S`"
Type=""
Status=0

System_Logs='/var/log/messages* /var/log/boot* /var/log/kern* /var/log/cron* /var/log/syslog* /var/log/auth* /var/log/secure* /var/log/utmp* /var/log/wtmp* /var/log/maillog*'

Audit_Logs='/var/log/audit/audit*'

Apache_Logs='/var/log/httpd/*access* /var/log/httpd/*error*'

Suricata_Logs="/var/log/suricata/suricata* /var/log/suricate/eve*"

All_Logs="${Suricata_Logs} ${System_Logs} ${Audit_Logs} ${Apache_Logs}"

Special_Logs=""

Print_Usage() {
    echo "Usage is:"
    echo ""
    echo "$1 <--help | -h>       Gives this message"
    echo ""
    echo "$1 <--type | -t Type>  Type, then '-t' or '--type' is used,"
    echo "                                       must be 'System', 'Audit', 'Apache',"
    echo "                                       'Suricata' or 'All'.  This will get"
    echo "                                       the specified LOG files into a ZIP file."
    echo ""
    echo "$1 <log file 1><...>   This option will only get the specified"
    echo "                                       log files.  These files must have paths"
    echo "                                       that are relative."
    echo ""

    if [ $2 -eq 2 ] ; then
        echo "The specified type of $3 is unknown.  Please try again"
    elif [ $2 -eq 3 ] ; then
        echo "There was not specified Type for '--type'"
    elif [ $2 -eq 4 ] ; then
        echo "There was not a specified Type or 'LOG FILE' specified."
    else
        echo "The final ZIP file will be called ’LOGS‐(hostname)‐(Date)‐(Type).zip’"
        echo "where (hostname) is the name of the system, (Date), ${Date}, is the"
        echo "Date/Time (YYYYMMDDhhmmss) logs were taken, and (Type) will be"
	echo "'System', 'Apache', 'Audit', 'Suricata', 'All' or 'User' for user"
        echo "specified files.  This file will be in '/tmp'."
    fi
}

# Are we ROOT?
if [[ $EUID -ne 0 ]]; then
    echo "This script, $0, must be run as ROOT"
    exit 5
fi

First="$1"
if [ "${First}" == "" ] ; then
    Status=4
    Print_Usage "$0" ${Status}
elif [[ "${First,,}" == "--help" || "${First,,}" == "-h" ]] ; then
    Print_Usage "$0" ${Status}
    Status=1
else
    if [[ "${First,,}" == "--type" || "${First,,}" == "-t" ]] ; then
	shift 1
        First="$1"
	if [ "${First}" == "" ] ; then
	    Status=3
            Print_Usage "$0" ${Status}
        elif [ ${First,,} == "system" ] ; then
            All_Logs="${System_Logs}"
            Type="System"
        elif [ ${First,,} == "suricata" ] ; then
            All_Logs="${Suricata_Logs}"
            Type="Suricata"
        elif [ ${First,,} == "apache" ] ; then
            All_Logs="${Apache_Logs}"
            Type="Apache"
        elif [ ${First,,} == "audit" ] ; then
            All_Logs="${Audit_Logs}"
            Type="Audit"
        elif [ ${First,,} == "all" ] ; then
            Type="All"
        else
            Status=2
            Print_Usage "$0" ${Status} "${First}"
        fi
    else
        Start=1
        End=$#
        All_Logs=""
        Type="User"
        while [ ${Start} -le ${End} ] ; do
            All_Logs+=" $1"
            Start=$(( Start + 1 ))
            shift 1
        done
    fi

    if [ ${Status} -eq 0 ] ; then
        zip -9 -j /tmp/LOGS-$(hostname)-${Date}-${Type}.zip ${All_Logs}
        echo "The LOG ZIP file is located at /tmp/LOGS-$(hostname)-${Date}-${Type}.zip"
    fi
fi

exit ${Status}
