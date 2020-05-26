#!/bin/bash

#
#	Name:	PSAddonInstallrt.sh
#
#	Synopsis:
#
#	It should be noted that the assumption here is that PowerShell is
#	not currently installed on the LINUX server.  So this  script  is
#	written  in BASH for the ability to install PowerShell.  Any Pow-
#	erShell commands needed will  be  handled  with  PowerShell  when
#	needed.
#
#	Examples:
#
#	Note:	$1 needs to be '-Install', '-PullOnly' or '-InstallSaved'
#		$2 can be -Verbose.
#
#	LINUX:/root/PS> 
#	./PSAssonInstaller -Install (add -Verbose to see output)
#	./PSAssonInstaller -PullOnly
#	./PSAssonInstaller -InstallSaved
#

#	Variables that need DEFAULTS

PowerShell_Version=0
VERSION="7.0.0"
POWER="powershell-${VERSION}-1.rhel.7.x86_64.rpm"
Verbose="1>/dev/null 2>&1"

PS_Version()
{
	if [ -e /usr/bin/pwsh ] ; then
		PowerShell_Version=$(/usr/bin/pwsh --version | cut -d" " -f2)
	fi
}

Install_PowerShell_7 ()
{
	echo "Getting ${PWOER}"
	wget https://github.com/PowerShell/PowerShell/releases/download/v${VERSION}/${POWER} ${Verbose}
	echo "Installing ${POWER}"
	yum localinstall --assumeyes ${POWER} ${Verbose}
}

if [ "$1" == "" ] ; then
	echo "You must specify '-Install', '-PullOnly' or '-InstallSaved'"
else
	PS_Version
	if [ "$1" == "-Install" ] ; then
	    if  [ ! -e /usr/bin/pwsh ] ; then
		if [ "$2" == "-Verbose" ] ; then
			Verbose=""
		fi
		Install_PowerShell_7
	    fi
	else
		if [ ! -e /usr/bin/pwsh ] ; then
			echo "Powershell is currently not installed.  Please install Powershell"
			echo "Use the command '$0 -Install' to install Powershell"
		fi
	fi
	if [ ! -e /tmp/pwsh ] ; then
		mkdir /tmp/pwsh
	fi
	/usr/bin/pwsh -File ./PSAddonInstaller.ps1 $1 $2 -Linux_Usage
fi
