# Install Winlogbeat, Sysmon, and GRR (Where Available)
By default, Winlogbeat is configured to send Security, Application, and System event logs. To add or remove logs or
change other Winlogbeat settings, edit the [winlogbeat.yml configuration file](
  https://www.elastic.co/guide/en/beats/winlogbeat/current/winlogbeat-configuration.html "This page describes how to
  configure Winlogbeat").

**Note:** Do not edit the logstash host, or your beats may not be detected.

From an account with administration privileges, run the Powershell script `setup.ps1`. There
are multiple ways to do this, including:
1. Log in as "Administrator" and run `setup.ps1`.
1. From a Powershell Window:
  1. Search for "Powershell"
  1. Right-click on `Powershell` or `Powershell ISE` and select "Run as adminstrator".
  1. In the resulting window, change folder to the folder containing the `setup.ps1`.
  script. For example, if `setup.ps1` is in the "Downloads" folder for a user named "joe":  
           cd C:\Users\joe\Downloads
  1. Run the `setup.ps1` script:  
           .\setup.ps1 [-grr [-grr_host IP_Address] [-grr_port Port_Number] ] [-logstash_host IP_Address] [-logstash_port Port_Number] [-help]

1. From a Windows Command Prompt:
  1. Search for "cmd".
  1. Right-click on the "Command Prompt" result and select "Run as administrator".
  1. In the resulting window, change folder to the folder containing the `setup.ps1`.
  script. For example, if `setup.ps1` is in the "Downloads" folder for a user named "joe":  
           cd C:\Users\joe\Downloads
  1. Run the `setup.ps1` script:  
           powershell .\setup.ps1 [-grr [-grr_host IP_Address] [-grr_port Port_Number] ]  [-logstash_host IP_Address] [-logstash_port Port_Number] [-help]

# Remove Sysmon, Winlogbeat, and GRR
From an account with administration privileges, run the Powershell script
`uninstall.ps1`. There are multiple ways to do this, including:
1. Log in as "Administrator" and run `uninstall.ps1`.
1. From a Powershell Window:
  1. Search for "Powershell".
  1. Right-click on `Powershell` or `Powershell ISE` and select "Run as adminstrator".
  1. In the resulting window, change folder to the folder containing the `uninstall.ps1`.
  script. For example, if `uninstall.ps1` is in the "Downloads" folder for a user named "joe":  
            cd C:\Users\joe\Downloads
  1. Run the `uninstall.ps1` script:  
            .\uninstall.ps1
1. From a Windows Command Prompt:
  1. Search for "cmd".
  1. Right-click on the "Command Prompt" result and select "Run as administrator"
  1. In the resulting window, change folder to the folder containing the `uninstall.ps1`.
  script. For example, if `uninstall.ps1` is in the "Downloads" folder for a user named "joe":  
           cd C:\Users\joe\Downloads
  1. Run the `uninstall.ps1` script:  
           powershell .\uninstall.ps1

# Changing a Host or Port Port Number
To change the host or port number used by GRR or Winlogbeat, remove Sysmon, Winlogbeat and GRR using the above
instructions and reinstall, specifying the host or port number on the command line.

**Failure to uninstall before calling `setup.ps1` may not implement the desired changes.**
