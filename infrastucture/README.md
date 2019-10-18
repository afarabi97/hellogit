# Physical Stack Build
These scripts are required for the physical build out of the DIP stack. Additional files are required that are not a part of this repository due to size.  These files are present on the PMO hard drive.

Additional Files:
- ESXi Version 6.5+ ISO
- Cisco IOS for 3850 Switch (Recommend Version: 15.2 Universal K9)
- Dell OS10 for S4112F-ON Switch (Required Version: 10.4.2.2)
- pfSense Firewall ISO Version 2.4.X or PMO OVF

## DIP Config Script
DIP_config_generator.sh generates the configuration files for the Cisco Switch, ESXi Host, and pfSense Firewall automatically.

Usage:
```bash
chmod +x DIP_config_generator.sh
sudo ./DIP_config_generator.sh {Optional Arguments}
Optional Arguments:
- esx - Create an ESX Configuration file
- switch | sw - Create a Switch Configuration file
- firewall | fw - Create a Firewall Configuration file
- all | a - Create an ESX, Firewall, and SWitch Configuration file
```

## Switch Config Script
###### BETA SOFTWARE AS IS NO WARRANTY OR REFUNDS
cisco_console_enable_ssh.sh is in beta.  It will establish IP management with a factory default switch via console cable to eliminate the need of user input. Modify the script variables (lines 27 - 36) as needed.

Usage:
```bash
chmod +x cisco_console_enable_ssh.sh
./cisco_console_enable_ssh.sh
```

*Pulled From*
https://bitbucket.di2e.net/scm/thisiscvah/physical-stack-build.git
