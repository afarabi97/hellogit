#!/bin/python3

#
# ********************************************************************************
# *										*
# *	This  python  file  contains the COMMON routines used by the THOR	*
# *	python scripts.  This makes it easier to  controll  common  rou‐	*
# *	tines  rather than having multiple copies of the same routine ev‐	*
# *	erywhere.								*
# *										*
# ********************************************************************************
#
#	History:
#
#	07-Oct-2020	ceburkhard
#	Version 3.0
#	Initial writinf of source.  New routine: Check_Root_User
#
# ********************************************************************************
#

import getpass
from os import system, name, geteuid
import subprocess


def Check_Root_User():
    User = geteuid()
    return (User == 0)


def Clear_The_Screen():
    if name == 'nt':
        _ = system('cls')

    else:
        _ = system('clear')


def Get_Yes_No(msg, x=True):
    # x is to allow exit from the choice but it is optional
    # Sometimes it's too late to exit.
    while True:
        choice = input(msg)
        if choice.lower() != 'y' and choice.lower() != 'n' and choice.lower() != 'x':
            if x:
                print('Invalid choice. [y/n/x]')
            else:
                print('Invalid choice. [y/n]')
        else:
            return choice.lower()


def Execute_Command(bashCmd=[]):
    if bashCmd:
        result = subprocess.run(
            bashCmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        result.stdout = result.stdout.decode('utf-8')
        result.stderr = result.stderr.decode('utf-8')
        #print("Command: ", " ".join(bashCmd))
        #print("Stdout: ", result.stdout)
        #print("Stderr: ", result.stderr)
        #print("Return code: ", result.returncode)
        #input("press enter to continue")
        return result
