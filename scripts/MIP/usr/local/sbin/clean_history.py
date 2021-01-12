#!/bin/python3

#
# ********************************************************************************
# *										*
# *	This  python  file will clear our all .bash_hostory file by basi‐	*
# *	cally using "truncate" to set the sizes to ZERO bytes.   It  will	*
# *	then  clean out the current user history so that if the user logs	*
# *	out aftter running this script all that is seen in the history if	*
# *	the command used (ie CONTROL‐D, shutdown ‐h now or reboot).		*
# *										*
# ********************************************************************************
#
#	History:
#
#	07-Oct-2020	ceburkhard
#	Version 3.0
#	Re-written from a BORNE shell script into PYTHON for RHEL 8.2
#
# ********************************************************************************
#

import os
from common_routines import Check_Root_User


def Remove_Bash_History():
    os.system("truncate -s 0 /root/.bash_history /home/*/.bash_history 2>/dev/null")


def Clean_History():
    if note Check_Root_User():
        print("You must be ROOT to run this script.")
    else:
        Remove_Bash_History()


def main():
    Clean_History()


if __name__ == "__main__":
    main()
