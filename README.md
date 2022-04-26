![alt text](web/frontend/src/assets/logo.png "TFPlenum Logo")

TFPlenum is the main project used for building out the CVAH weapon system.  This repository contains all the source code needed to build the entire defensive cyber system either on a hardware platform or on an ESXi server.  TFPlenum in a nut shell is a controller VM loaded with all the dependencies needed to build out a Kubernetes cluster with the ability to deploy out a large set of cyber detection tools on that cluster using HELM charts.  To name a few tools it has as it disposal is the Elasticsearch SIEM engine, Zeek, Suricata, and Arkime.

Furthermore, TFPlenums Controller is also used to setup the Mobile Interceptor Platform (MIP) laptop for Cyber Protection Teams (CPT) as well as Mission Defense Teams (MDT) so operators can affectively carry out their missions with a wide range of tools. 

[[_TOC_]]


## Folder and prominent file overview

This section attempts to highlight the most relevant folders and files relevant to developers or testers. 

- <strong>.spec</strong> - Contains the RPM spec files needed for building the tfplenum and tfplenum-repo RPM packages.
- <strong>agent_pkgs</strong> - Contains all the agent packages that are deployable to mission partner hosts from the controller.
- <strong>bootstrap</strong> - Contains all the playbooks needed for setting up the development controller or the production controller.
- <strong>component-builder</strong> - Build system for building all the Helm charts, Docker containers and RPMs.
  - <strong>components</strong> - This subfolder contains all the files needed to build each subcomponent of the system.  This includes rocketchat, suricata, zeek, wikijs, and much much more.
  - <strong>build.py</strong> - Gitlab pipeline will use this script to build each component of the system whether it be a Dockerfile, Helm chart, or RPM.  This script may also be run manually. 
  - <strong>cleanup-nexus.sh</strong> - Shell script for deleting old releases out of tfplenum-dev on the SIL's Nexus server.
  - <strong>update_charts.py</strong> - Updates the charts on a development controller. (<strong>NOTE:</strong> This script is not included on a production controller.
- <strong>core</strong> - Contains all the playbooks needed for setting up the Kubernetes cluster and provisioning out the Servers, Sensors, and Service nodes.
- <strong>docs</strong> - Contains all the project readme files for developers and testers.
- <strong>gip</strong> - Contains all the playbooks needed by the export pipeline needed for setting up minio OVA and services OVA.
- <strong>gitlab</strong> - Contains all the .gitlab-ci.yml files for all the various pipeline jobs within the project.
- <strong>infrastructure</strong> - Contains all the scripts needed to build the Firewall and Switch scripts for hardware Deployable Intercetor Platform (DIP) and Garrison Interceptor Platform (GIP) kit setups. Furthermore, it also contains the ks.cfg file which is used to kickstart / setup the ESXi server.
- <strong>mip</strong> - Contains all the playbooks needed for setting up a Mobile Interceptor Platform (MIP)
- <strong>rhel8-stigs</strong> - Contains the playbook needed for stigging the entire system.
- <strong>scripts</strong> - Contains scripts for getting diagnostics info, retreiving file beats certificates and others.
- <strong>testing</strong> - Contains all the code needed for the developer-all, export-all, and hw-developer-all pipelines
  - <strong>infrastructure</strong> - Contains scripts for setting up the CI/CD infrastructure.
- <strong>web</strong> - Contains all the Python and Angular code needed to build the controller's frontend and backend web application.
  - <strong>backend</strong> - Contains the Python code for the controller's REST interface.
  - <strong>frontend</strong> - Contains the Anguar frontend interface for both the controller.
- <strong>bootstrap.sh</strong> - Script that is used for boostrapping a development controller.
- <strong>manifest.yaml</strong> - This file is responsible for creating the portable hard drives that go to the end users (IE: Operators) of the system.
- <strong>requirements.txt</strong> - This file version locks the backend python REST interface for the project.
- <strong>versions.yml</strong> - This file version locks all the interal version for both the DIP and GIP controller

## SIL Services

| Link | Username/Password | DESCRIPTION | 
| ---      | ---      | ---      |
| [VCenter](https://vcenter.sil.lab/) | your domain user/pass | VCenter for both Developers and Testers. |
| [Nexus Artifact Repository](https://nexus.sil.lab/) | your domain user/pass | Main binary repository used for storing our custom built packages as well as used for caching online resources needed to build the TFPlenum system. |
| [Sonarqube Services](http://sonarqube.sil.lab:9000/) | admin/?? | Static analysis code tools used within the Gitlab CI/CD pipeline that finds code smells as well as potential bugs. |
| [Service Now](https://afdco.servicenowservices.com/sp) | your help desk user/pass | Help Desk Ticketing system |
| [Verodin](https://10.30.206.200) | dev-user@sil.local/waterfall | Verodin Malware traffic generation |
| [Breaking point SFF](https://10.10.103.33/bps/login) | admin/waterfall | Breaking point for Small Form Factor (SFF) |
| [Ixia for SFF](https://10.10.103.212/ixiaNtoLicense.jsp) | admin/waterfall | Ixia for SFF |
| [Breaking point Dev](http://10.10.103.29/) | admin/waterfall | Breaking point for Developer |
| [Ixia for Dev](https://10.10.103.211/ixiaNtoLicense.jsp) | admin/waterfall  | Ixia for Developers |
| [Breaking point testers](http://10.10.103.31/) | admin/waterfall | Breaking point for Testers |
| [Ixia for Testers](https://10.10.103.210/ixiaNtoLicense.jsp) | admin/waterfall | Ixia for Testers |
| [GIP 19](https://g019-vcenter.nmil.cvah) | administrator@nmil.cvah/?? | Add <strong>10.19.2.4 g019-vcenter.nmil.cvah</strong> to your /etc/hosts file in order to gain access |
| [GIP 20](https://g020-vcenter.nmil.cvah) | administrator@nmil.cvah/?? | Add <strong>10.20.2.4 g020-vcenter.nmil.cvah</strong> to your /etc/hosts file in order to gain access |


## Confluence Guides

| Link | DESCRIPTION | 
| ---      | ---      |
| [Install guide](https://confluence.di2e.net/display/THISISCVAH/v3.7+R440+Common+Node+Deployable+Interceptor+Platform+%28DIP%29+Installation+Guide?src=contextnavpagetreemode) | Main install guide for common node installations. |
| [Operations guide](https://confluence.di2e.net/display/THISISCVAH/v3.7+Deployable+Interceptor+Platform+%28DIP%29+Operations+Guide?src=contextnavpagetreemode) | Main operations guide for common node installations. |
| [VDD for CPT](https://confluence.di2e.net/display/THISISCVAH/v3.6+Cyber+Protection+Team+%28CPT%29+VDD?src=contextnavpagetreemode) | The version description document for cyber protection teams. |
| [VDD for MDT](https://confluence.di2e.net/display/THISISCVAH/v3.6+Mission+Defense+Team+%28MDT%29+VDD) | The version description document for mission defense teams. |

## How to cut a release and build a drive
[Click here to see document](docs/build_drive_procedures.md)

## Virtual Pipeline setup
[Click here to see document](docs/virtual_pipeline_setup.md)

## Component builder
[Click here to see document](docs/component_builder.md)

## Hardware Kits
[Click here to see document](docs/hardware_kits.md)
