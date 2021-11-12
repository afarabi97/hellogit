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


## Virtual Pipeline setup

### How to Fork tfplenum

> All developers and testers will be required to run through these steps for setting up their environment.

1. Go to https://gitlab.sil.lab/tfplenum/tfplenum
2. Log in with SIL domain credentials
3. Click ```Fork``` 
5. Select a namespace to fork the project. (<strong>NOTE:</strong> This should be your personal namespace or username.)
6. Select the Internal Raido button. (<strong>NOTE:</strong> Selecting internal will allow others on project to view your pipelines and check out or push code to your branches if needed.  This is the recommended setting but can always be changed later.)
7. click. ```Fork Project```
8. Modify Project Settings
   1. <strong>Settings → General</strong> (https://gitlab.sil.lab/<strong>domain username</strong>/tfplenum/edit)
   2. Expand ```Visibility, project features, permissions``` section
   3. Modify the following settings:
   4. <strong>Project visibility:</strong> Internal
   5. <strong>Issues:</strong> Disable
   6. <strong>Forks:</strong> Disable
   7. <strong>Git Large File Storage (LFS):</strong> Disable
   8. <strong>Packages:</strong> Disable
   9. <strong>Analytics:</strong> Disable
   10. <strong>Security & Compliance:</strong> Disable
   11. <strong>Wiki:</strong> Disable
   12. <strong>Snippets:</strong> Disable
   13. Click ```Save changes``` button

#### How to setup mirroring on your fork (Optional)

> The following steps are optional. It is recommended these steps be done if you wish to keep your forked protected branches (IE: devel, release/*) synced to the main repository.

1. Go to your fork of tfplenum (https://gitlab.sil.lab/<strong>domain username</strong>/tfplenum)
2. <strong>Settings → Repository</strong> (https://gitlab.sil.lab/<strong>domain username</strong>/tfplenum/-/settings/repository)
3. Expand <strong>Mirroring repositories</strong> section
4. Fill out the Mirroring repo form
   1. <strong>Git repository URL:</strong> https://<strong>domain username</strong>@gitlab.sil.lab/tfplenum/tfplenum.git
   2. <strong>Mirror direction:</strong> Pull
   3. <strong>Password:</strong> SIL Domain Password
   4. <strong>Mirror only protected branches:</strong> Check this option
   5. Click ```Mirror Repository```

## How to keep a fork of devel up-to-date

> The following steps are recommended for developers. 

1. Add tfplenum as a remote repo
   - Gitkraken
      1. Under <strong>Remote</strong> on the left Click ```+```
      2. Select ```tfplenum/tfplenum``` from the dropdown
      3. Click ```Add Remote```
   - Git CLI
      1. git remote add tfplenum https://gitlab.sil.lab/tfplenum/tfplenum.git
2. Checkout tfplenum devel
   - GitKraken
      1. Right click <strong>devel</strong> under tfplenum remote repo, Select ```Create Branch Here```
      2. Type <strong>tfplenum_devel</strong> or a different name than your local fork devel the names cannot be the same.
      3. Verify the <strong>tfplenum_devel</strong> upstream
      4. Under <strong>Local</strong>, Right click ```tfplenum_devel```
      5. Select ```Set Upstream```, verify the upstream repo is set to <strong>tfplenum</strong>, If its not set to <strong>tfplenum</strong> change it to <strong>tfplenum</strong> then click ```Submit```
   - Git CLI (<strong>NOTE:</strong> commands need to be performed in a shell terminal)
      1. ```git checkout -b tfplenum_devel tfplenum/devel```
3. Rebase forked devel
   - Gitkraken
      1. Under <strong>Local</strong>, Double click <strong>tfplenum_devel</strong>
      2. Select <strong>Pull</strong>
      3. Under <strong>Local</strong>, Double click <strong>devel</strong>
      4. Click and Drag <strong>devel on top of <strong>tfplenum_devel</strong>
      5. Select ```Rebase devel onto tfplenum_devel```
      6. Click ```Push``` to push <strong>devel</strong> back to your fork
   - Git CLI
      1. ```git checkout devel```
      2. ```git pull```
      3. git checkout ```some other branch```
      4. ```git rebase devel```


### Gitlab variable order precedence

Understanding gitlab variable order precendence is paramount when building out schedules.  The following list shows the order of precedence. 
The order of precedence for variables is (from highest to lowest):

1. Schedule pipeline variables
2. Project varibles.
3. Instance variables. (<strong>NOTE:</strong> Instance variables do not need to be overridden in the main tfplenum repo or any of the forks off of that repository.  These are essentially shared variables accross all forks and the main tfplenum repository.)

<p>
<details>
<summary>Click here to show list of overridden instance variables.</summary>
    <ul>
        <li>ACCESS_TOKEN</li>
        <li>CONFLUENCE_PASSWORD</li>
        <li>CONFLUENCE_USERNAME</li>
        <li>CONTROLLER_PASSWORD</li>
        <li>DEFAULT_TEMPLATE_PASSWORD</li>
        <li>DEFAULT_VM_PASSWORD</li>
        <li>LABREPO_PASSWORD</li>
        <li>LUKS_PASSWORD</li>
        <li>MIP_PASSWORD</li>
        <li>NEXUS_PASSWORD</li>
        <li>NEXUS_USER</li>
        <li>RELEASE_PRIVATE_TOKEN</li>
        <li>REPO_PASSWORD</li>
        <li>REPO_USERNAME</li>
        <li>SIL_CA_BUNDLE</li>
        <li>VCENTER_PASSWORD</li>
        <li>VCENTER_USERNAME</li>        
    </ul>
</details>
</p>

5. Variables defined in .gitlab-ci.yml file.
  - All variable definitions are defined here. Many of them will be left blank so they can be overridden by a higher precedence within Gitlab.

For more details on how order of precedence works within gitlab please consult [Gitlab Variable Precedence](https://docs.gitlab.com/ee/ci/variables/#cicd-variable-precedence).

### How to setup schedules in your fork

To modify your project CI/CD variables and create a new schedule peform the following steps:

1. Go to your forked repos settings in https://gitlab.sil.lab/<strong>domain username</strong>/tfplenum/-/settings/ci_cd
2. Click on the ```Expand``` button next to the <strong>Variables section.
3. Add the variables that must be overridden Expand <strong>Project level variables that must be overridden.</strong>.  Expand <strong>All the virtual pipeline variables.</strong> below to show a list below on what to override them with.

<p>
<details>
<summary>Project level variables that must be overridden.</summary>
    <ul>
        <li>NETWORK_ID</li>
        <li>REPO_URL</li>
        <li>VCENTER_PORTGROUP</li>
        <li>VM_GATEWAY</li>
        <li>VM_PREFIX</li>
        <li>VMWARE_FOLDER</li>
    </ul>
</details>
</p>

4. Go to your forked repos schedules https://gitlab.sil.lab/<strong>domain username</strong>/tfplenum/-/pipeline_schedules
5. Click on ```New Schedule``` Button
6. Override the below varibles.

<p>
<details>
<summary>Schedule level variable that must be overridden.</summary>
<ul>
    <li>KIT_DOMAIN</li>
    <li>PIPELINE</li>
    <li>NETWORK_BLOCK_INDEX</li>
</ul>
</p>

7. Uncheck the ```Active``` checkbox so the pipeline does not run on a cron schedule.
8. (optional) Select your branch
9. Click on ```Save pipeline schedule``` button.
10. Click on the ```>``` button next to the schedule!

<p>
<details>
<summary>All the virtual pipeline variables.</summary>

| VARIABLE NAME | DEFAULT | OTHER POSSIBLE VALUES | DESCRIPTION | 
| ---      | ---      | ---      | ---      |
| VMWARE_FOLDER   | Testing   | Any of the VM Template folders listed in vcenter | This is the folder in vcenter which will be the home of all the VMs generated by the pipeline |
| NETWORK_ID | 10.40.12.0 | Any /24 subnet on our vcenter network 172.16.31.0 through 172.16.86.0 10.40.11.0 through 10.40.26.0 | This network ID is needed for various reasons and should be overridden based on your port group. |
| VM_GATEWAY | 10.40.12.1 | Should be your Network ID with a .1 in the last octet | This is the primary gateway for your Kit. It should be set to your network ID with a .1 in the last octet. |
| VCENTER_PORTGROUP |  | Any port group name listed in VCenter | This must be overridden for each schedule. |
| VM_PREFIX | test1 | This can be any alphanumeric value. I would recommend to use your first or last name for it. | This will prefix all your VM names with what ever you enter into this value. CANNOT container capital letters. |
| KIT_DOMAIN | lan | Any valid domain name suffix | This will be the domain for the kit by default it is set to lan |
| PIPELINE | | This can be set to developer-all, static_analysis_only, or test-reposync-server | The pipeline that will be run when it is manually triggered. The developer-all pipeline will run only the jobs needed to setup a DIP Kit. If you set static_analysis_only with RUN_CODE_CHECKS set to yes, it will only run sonarqube checks. The test-reposync-server pipeline will build a RHEL 8 Reposync VM for testing purposes. |
| RUN_INTEGRATION | no | yes | For the developer-dip pipeline or the developer-all pipeline, if this value is set to true, it will run the integration tests and simulate power failure for the DIP Kit. Only set this to true if you touched code that affects the core system in some way. The nightly jobs will automatically run this. |
| COMMUNITY_APPS | no | yes	| Run job to install Community apps instead of just PMO supported apps. |
| TEMPLATE_TO_CLONE | RHEL8 Template | RHEL7 Template (pre 10/16 commits) or RHEL8 Template | This is the VM or template that will be cloned for your starting controller. If you are using the build_from_scratch variable, use the "DIP TEST Template" value. Otherwise only use default value. |
| NETWORK_BLOCK_INDEX | 0 | 0 through 2 are valid values | [64, 128, 192] When left at the default, the last octet of your controller will be 64. If your network ID was set to 10.40.12.0, than your controller would be set to 10.40.12.81. The servers and sensors will be set to 10.40.12.82 - 88. The Kit's Kickstart DHCP range will be set to 10.40.12.89 - 95 and the Kit's Kubernetes service range will be set to 10.40.12.96 - 111. |
| MINIO_NETWORK_BLOCK_INDEX | 1 | 0 through 2 are valid values | [64, 128, 192] Minio will be set to 128 address as last octect |
| VCENTER_DATASTORE | DEV-vSAN | DEV-vSAN | Developer schedules for DIPs should use dev-01 for this variable and not the default. These volumes are where your VMs will be stored currently the dev-vols have the most space. Quick test kits can be spun up on the NVMe Storage |
| DNS_SERVERS | 10.10.101.248 10.10.101.11 10.10.101.12	|  | These should not need to be changed or set in your schedule. If these server IPs ever change, the defaults can be updated by updating the .gitlab-ci.yml file. |
| NUM_MIPS | 1 | 1 through 4 are valid values | The number of MIPs to setup. Normally you don't need more than one unless your doing integration testing. |
| NUM_SERVERS | 2 |  2 through 5 are valid values | The number of servers that will be spun up. |
| NUM_SENSORS | 1 | 1 through 5 are valid values | The number of sensors that will be spun up. |
| NUM_SERVICE_NODES | 1 | 1 through 5 are valid values | The number of service nodes that will be spun up. |
| SERVER_CPU | 16 | 2 through 64 are valid values | The default number of CPU cores that will be assigned to each server. |
| SERVER_MEM | 24576 | Cannot be less than 1024 and not larger than 65536 | The default amount of memory in MB assigned to each server. |
| SENSOR_CPU | 16 | 2 through 64 are valid values | The default number of CPU cores that will be assigned to each sensor. |
| SENSOR_MEM | 16384 | Cannot be less than 1024 and not larger than 65536 | The default amount of memory in MB assigned to each sensor. |
| SERVICE_CPU | 8 | 2 through 64 are valid values | The default number of CPU cores that will be assigned to each service node. |
| SERVICE_MEM | 12288 | Cannot be less than 1024 and not larger than 65536 | The default amount of memory in MB assigned to each service node. |
| MIP_CPU | 16 | 2 through 64 are valid values | The default number of CPU cores that will be assigned to each MIP. |
| MIP_MEM | 24576 | Cannot be less than 1024 and not larger than 65536 | The default amount of memory in MB assigned to each MIP. |
| RUN_CODE_CHECKS | yes | no | Run sonarqube and other linting tools for static code analyis when set to yes |

</details>
</p>


## Component builder

The component builder which can be found under component-builder/ directory is directly responsible for building out all the custom Docker containers, Helm charts and RPMs for all the subcomponents contained within the TFPlenum controller.

### How to build a helm chart

1. Open up any of the component folders (EX: component-builder/component/rocketchat/helm)
2. Add or update any of the files within this folder.
3. Open up version.yml in the projects root folder 
4. Increment the associated helm version number in the <strong>helm_versions:</strong> section. (<strong>NOTE:</strong> Failure to update the version number will result in a job failure as nexus is setup with to deny duplicate version numbers from being published.)
5. Commit the code and push it up to your gitlab fork.  A pipeline will automatically get spawned based on the changes you made and it will both build and publish the Helm chart to the nexus.sil.lab 

### How to build a docker container

1. Open up any of teh component folders that has a custom docker container file (EX: component-builder/component/suricata/templates/Dockerfile.j2)
2. Make changes to the Dockerfile.j2 template as well as any docker context changes (EX: component-builder/component/suricata/docker folder).
  - The docker context folder in the example can hold any files you wish to copy into the docker container itself.
3. Open up version.yml in the projects root folder
4. Increment the associated helm version number in the <strong>docker_versions:</strong> section. (<strong>NOTE:</strong> Failure to update the version number will result in a job failure as nexus is setup with to deny duplicate version numbers from being published.)
5. Commit the code and push it up to your gitlab fork.  A pipeline will automatically get spawned based on the changes you made and it will both build and publish the new docker container to the nexus.sil.lab 

### How to build a RPM package.

1. Ensure all your code is pushed up.
2. Create a tag with one of the following formats vX.X.Xdev-1 or vX.X.Xdev-1-```component name```
  - The first format will build all the rpms with the specified version then publish to nexus. (<strong>NOTE:</strong> Anything marked with the dev tag with the same version will be overridden.) 
  - The second cormat will build a specific RPM.  For example v3.7.0-1-arkime, will only build the tfplenum-arkime RPM package and publish to nexus.
3. After the tag is created a pipeline will build and publish the rpms to [tfplenum-dev repo](https://nexus.sil.lab/#browse/browse:tfplenum-dev).
4. Make sure the the latest version of [tfplenum-cli](https://gitlab.sil.lab/tfplenum/tfplenum-cli) repo is also published.  Follow the same instructions for creating the tag.

### How to cut a stable release

1. Ensure all code has been tested and is ready to go and committed.
2. Create a tag with the vX.X.X-1 format. (<strong>NOTE:</strong> If there are RPMs in the [tfplenum-stable repo](https://nexus.sil.lab/#browse/browse:tfplenum-stable) with the same version as the tag just created, the job will fail. RPM overrides are not allowed in the stable repository.)
3. After the tag is create, it will spawn a pipeline building all the RPMs and it will publish it to the [tfplenum-stable repo](https://nexus.sil.lab/#browse/browse:tfplenum-stable)
4. Make sure the the latest version of [tfplenum-cli](https://gitlab.sil.lab/tfplenum/tfplenum-cli) repo is also published.  Follow the same instructions for creating the tag.

### How to build a hardware or virtual kit using RPMs

1. Open up the schedule you use to build your kit.
2. Add the ```RPM_BUILD``` variable to it.
3. For the value enter either ```stable``` or ```dev```.
  - The stable value uses the [tfplenum-stable repo](https://nexus.sil.lab/#browse/browse:tfplenum-stable) for provisioning the controller
  - The dev value uses the [tfplenum-dev repo](https://nexus.sil.lab/#browse/browse:tfplenum-dev) for provisioning the controller.
  > <strong>NOTE:</strong> The latest versions of the RPMs will be selected in the above repositories.
4. Hit play on your schedule.

## Hardware Kits

To schedule the usage of a hardware kit go here [Hardware Kit Calendar](https://confluence.di2e.net/calendar/calendarPage.action?spaceKey=THISISCVAH&calendarId=7143902f-fd4d-467b-b937-13607f1db498).

<p>
<details>
<summary>Click this to show all the hardware kit IDRAC and internal links.</summary>

| Kit Name | IDRAC Links | Internal Kit Links | 
| ---      | ---      | ---      | 
| Aquaman | <ul><li>https://idrac1.aquaman/</li><li>https://idrac2.aquaman/</li><li>https://idrac3.aquaman/</li><li>https://idrac4.aquaman/</li><li>https://idrac5.aquaman/</li><li>https://idrac6.aquaman/</li><li>https://idrac7.aquaman/</li><li>https://idrac8.aquaman/</li></ul> | <ul><li>https://esx.aquaman/</li><li>https://firewall.aquaman/</li><li>https://controller.aquaman/</li></ul> | 
| Batman | <ul><li>https://idrac1.batman/</li><li>https://idrac2.batman/</li><li>https://idrac3.batman/</li><li>https://idrac4.batman/</li><li>https://idrac5.batman/</li><li>https://idrac6.batman/</li><li>https://idrac7.batman/</li></ul> | <ul><li>https://esx.batman/</li><li>https://firewall.batman/</li><li>https://controller.batman/</li></ul> | 
| Catwoman | <ul><li>https://idrac1.catwoman/</li><li>https://idrac2.catwoman/</li><li>https://idrac3.catwoman/</li><li>https://idrac4.catwoman/</li><li>https://idrac5.catwoman/</li><li>https://idrac6.catwoman/</li><li>https://idrac7.catwoman/</li></ul> | <ul><li>https://esx.catwoman/</li><li>https://firewall.catwoman/</li><li>https://controller.catwoman/</li></ul> | 
| Deadshot | <ul><li>https://idrac1.deadshot/</li><li>https://idrac2.deadshot/</li><li>https://idrac3.deadshot/</li><li>https://idrac4.deadshot/</li><li>https://idrac5.deadshot/</li><li>https://idrac6.deadshot/</li><li>https://idrac7.deadshot/</li></ul> | <ul><li>https://esx.deadshot/</li><li>https://firewall.deadshot/</li><li>https://controller.deadshot/</li></ul> | 
| Flash | <ul><li>https://idrac1.flash/</li><li>https://idrac2.flash/</li><li>https://idrac3.flash/</li><li>https://idrac4.flash/</li><li>https://idrac5.flash/</li><li>https://idrac6.flash/</li><li>https://idrac7.flash/</li></ul> | <ul><li>https://esx.flash/</li><li>https://firewall.flash/</li><li>https://controller.flash/</li></ul> | 
| Greenlantern | <ul><li>https://idrac1.greenlantern/</li><li>https://idrac2.greenlantern/</li><li>https://idrac3.greenlantern/</li><li>https://idrac4.greenlantern/</li><li>https://idrac5.greenlantern/</li><li>https://idrac6.greenlantern/</li><li>https://idrac7.greenlantern/</li></ul> | <ul><li>https://esx.greenlantern/</li><li>https://firewall.greenlantern/</li><li>https://controller.greenlantern/</li></ul> | 
| Harlequin | <ul><li>https://idrac1.harlequin/</li><li>https://idrac2.harlequin/</li><li>https://idrac3.harlequin/</li><li>https://idrac4.harlequin/</li><li>https://idrac5.harlequin/</li><li>https://idrac6.harlequin/</li><li>https://idrac7.harlequin/</li></ul> | <ul><li>https://esx.harlequin/</li><li>https://firewall.harlequin/</li><li>https://controller.harlequin/</li></ul> | 
| Phuket | <ul><li>https://idrac1.phuket/</li><li>https://idrac2.phuket/</li><li>https://idrac3.phuket/</li><li>https://idrac4.phuket/</li><li>https://idrac5.phuket/</li><li>https://idrac6.phuket/</li><li>https://idrac7.phuket/</li></ul> | <ul><li>https://esx.phuket/</li><li>https://firewall.phuket/</li><li>https://controller.phuket/</li></ul> | 
| Rooks | <ul><li>https://idrac1.rooks/</li><li>https://idrac2.rooks/</li><li>https://idrac3.rooks/</li><li>https://idrac4.rooks/</li><li>https://idrac5.rooks/</li><li>https://idrac6.rooks/</li><li>https://idrac7.rooks/</li></ul> | <ul><li>https://esx.rooks/</li><li>https://firewall.rooks/</li><li>https://controller.rooks/</li></ul> | 

</details>
</p>

<p>
<details>
<summary>Click this to show all the hardware physical rack layouts.</summary>

> '#' stands for the actual elevation number on the physical rack. In the server room first find the Rack number (IE: Rack 1).  Then find the elevation number to identify where the hardware actually is.

<strong>Rack 3</strong>

| # | Physical equipment | Notes |
| ---      | ---      | ---      |
| 42 | Dell 4112 Switch | Aquaman Switch | 
| 41 | | |
| 40 | iDRAC-R440-Kit1-1 | Aquaman Legacy R440 ESXI Server |
| 39 | iDRAC-R440-Kit1-2 | Aquaman Legacy R440 Server 1 |
| 38 | iDRAC-R440-Kit1-3 | Aquaman Legacy R440 Server 2 |
| 37 | iDRAC-R440-Kit1-4 | Aquaman Legacy R440 Sensor 1 |
| 36 | iDRAC-R440-Kit1-5 | Aquaman Legacy R440 Sensor 2 |
| 35 | iDRAC-R440-Kit1-6 | Aquaman Legacy R440 Sensor 3 |
| 34 | iDRAC-R440-Kit1-7 | Aquaman Legacy R440 Sensor 4 |
| 33 | iDRAC-R440-Kit1-8 | Aquaman Legacy R440 Sensor 5 |
| 32 | | |
| 31 | Dell 4112 Switch | | Batman Switch |
| 30 | iDRAC-R440-Kit2-1 | Batman Legacy R440 ESXI Server |
| 29 | iDRAC-R440-Kit2-2 | Batman Legacy R440 Server 1 |
| 28 | iDRAC-R440-Kit2-3 | Batman Legacy R440 Server 2 |
| 27 | iDRAC-R440-Kit2-4 | Batman Legacy R440 Sensor 1 |
| 26 | iDRAC-R440-Kit2-5 | Batman Legacy R440 Sensor 2 |
| 25 | iDRAC-R440-Kit2-6 | Batman Legacy R440 Sensor 3 |
| 24 | iDRAC-R440-Kit2-7 | Batman Legacy R440 Sensor 4 |
| 23 | Dell 4112 Switch | Catwoman Switch | 
| 22 | iDRAC-R440-Kit3-1 | Catwoman R440 Common Node ESXI Server |
| 21 | iDRAC-R440-Kit3-2 | Catwoman R440 Common Node Server 1 |
| 20 | iDRAC-R440-Kit3-3 | Catwoman R440 Common Node Server 2 |
| 19 | iDRAC-R440-Kit3-4 | Catwoman R440 Common Node Sensor 1 |
| 18 | iDRAC-R440-Kit3-5 | Catwoman R440 Common Node Sensor 2 |
| 17 | iDRAC-R440-Kit3-6 | Catwoman R440 Common Node Sensor 3 |
| 16 | iDRAC-R440-Kit3-7 | Catwoman R440 Common Node Sensor 4 |
| 15 | | | 
| 14 | Dell 4112 Switch | Deadshot Switch | 
| 13 | iDRAC-R440-Kit4-1 | Deadshot ESXI Server | 
| 12 | iDRAC-R440-Kit4-2 | Deadshot R440 Common Node Server 1 | 
| 11 | iDRAC-R440-Kit4-3 | Deadshot R440 Common Node Server 2 | 
| 10 | iDRAC-R440-Kit4-4 | Deadshot R440 Common Node Sensor 1 | 
| 9 | iDRAC-R440-Kit4-5 | Deadshot R440 Common Node Sensor 2 | 
| 8 | iDRAC-R440-Kit4-6 | Deadshot R440 Common Node Sensor 3 | 
| 7 | iDRAC-R440-Kit4-7 | Deadshot R440 Common Node Sensor 4 | 
| 6 | PDU 1 | | 
| 5 | PDU 1 | | 
| 4 | PDU 1 | | 
| 3 | PDU 2 | | 
| 2 | PDU 2 | | 
| 1 | PDU 2 | | 

<strong>Rack 4</strong>

| # | Physical equipment | Notes   |
| ---      | ---      | ---      |
| 42 | | | 
| 41 | | | 
| 40 | | | 
| 39 | | | 
| 38 | | | 
| 37 | | | 
| 36 | | | 
| 35 | | | 
| 34 | | | 
| 33 | | | 
| 32 | | | 
| 31 | Dell 4112 switch | Greenlantern Switch | 
| 30 | iDRAC-R440-Kit7-1 | Greenlantern R440 Common Node ESXI | 
| 29 | iDRAC-R440-Kit7-2 | Greenlantern R440 Common Node Server 1 | 
| 28 | iDRAC-R440-Kit7-3 | Greenlantern R440 Common Node Server 2 | 
| 27 | iDRAC-R440-Kit7-4 | Greenlantern R440 Common Node Sensor 1 | 
| 26 | iDRAC-R440-Kit7-5 | Greenlantern R440 Common Node Sensor 2 | 
| 25 | iDRAC-R440-Kit7-6 | Greenlantern R440 Common Node Sensor 3 | 
| 24 | iDRAC-R440-Kit7-7 | Greenlantern R440 Common Node Sensor 4 | 
| 23 | | | 
| 22 | Dell 4112 switch | Harlequin Switch | 
| 21 | iDRAC-R440-Kit8-1 | Harlequin R440 Common Node ESXI | 
| 20 | iDRAC-R440-Kit8-2 | Harlequin R440 Common Node Server 1 | 
| 19 | iDRAC-R440-Kit8-3 | Harlequin R440 Common Node Server 2 | 
| 18 | iDRAC-R440-Kit8-4 | Harlequin R440 Common Node Sensor 1 | 
| 17 | iDRAC-R440-Kit8-5 | Harlequin R440 Common Node Sensor 2 | 
| 16 | iDRAC-R440-Kit8-6 | Harlequin R440 Common Node Sensor 3 | 
| 15 | iDRAC-R440-Kit8-7 | Harlequin R440 Common Node Sensor 4 | 
| 14 | | | 
| 13 | | | 
| 12 | | | 
| 11 | | | 
| 10 | | | 
| 9 | | | 
| 8 | | | 
| 7 | | | 
| 6 | PDU 1 | | 
| 5 | PDU 1 | | 
| 4 | PDU 1 | | 
| 3 | PDU 2 | | 
| 2 | PDU 2 | | 
| 1 | PDU 2 | | 


<strong>Rack 5</strong>

| # | Physical equipment | Notes   |
| ---      | ---      | ---      |
| 42 | | | 
| 41 | | | 
| 40 | | | 
| 39 | | | 
| 38 | | | 
| 37 | | | 
| 36 | | | 
| 35 | | | 
| 34 | | | 
| 33 | | | 
| 32 | Dell 4112 switch | | 
| 31 | iDRAC-R440-Kit6-1 | Flash Legacy R440 ESXI | 
| 30 | iDRAC-R440-Kit6-2 | Flash Legacy R440 Server 1 | 
| 29 | iDRAC-R440-Kit6-3 | Flash Legacy R440 Server 2 |  
| 28 | iDRAC-R440-Kit6-4 | Flash Legacy R440 Sensor 1 | 
| 27 | iDRAC-R440-Kit6-5 | Flash Legacy R440 Sensor 2 | 
| 26 | iDRAC-R440-Kit6-6 | Flash Legacy R440 Sensor 3 | 
| 25 | iDRAC-R440-Kit6-7 | Flash Legacy R440 Sensor 4 | 
| 24 | | | 
| 23 | | | 
| 22 | Dell 4112 switch | | 
| 21 | iDRAC-R440-Kit9-1 | Phuket Legacy R440 ESXI | 
| 20 | iDRAC-R440-Kit9-2 | Phuket Legacy R440 Server 1 | 
| 19 | iDRAC-R440-Kit9-3 | Phuket Legacy R440 Server 2 | 
| 18 | iDRAC-R440-Kit9-4 | Phuket Legacy R440 Sensor 1 | 
| 17 | iDRAC-R440-Kit9-5 | Phuket Legacy R440 Sensor 2 | 
| 16 | iDRAC-R440-Kit9-6 | Phuket Legacy R440 Sensor 3 | 
| 15 | iDRAC-R440-Kit9-7 | Phuket Legacy R440 Sensor 4 | 
| 14 | | | 
| 13 | | | 
| 12 | | | 
| 11 | | | 
| 10 | | | 
| 9 | | | 
| 8 | | | 
| 7 | | | 
| 6 | | | 
| 5 | | | 
| 4 | | | 
| 3 | | | 
| 2 | | | 
| 1 | | | 


</details>
</p>

### Hardware pipelines Gitlab schedules

1. [Main Schedules Page](https://gitlab.sil.lab/tfplenum/tfplenum/-/pipeline_schedules)
2. [Rooks](https://gitlab.sil.lab/tfplenum/tfplenum/-/pipeline_schedules/184/edit)
3. [Greenlantern](https://gitlab.sil.lab/tfplenum/tfplenum/-/pipeline_schedules/181/edit) 
4. [Phuket](https://gitlab.sil.lab/tfplenum/tfplenum/-/pipeline_schedules/147/edit)
5. [Flash](https://gitlab.sil.lab/tfplenum/tfplenum/-/pipeline_schedules/135/edit)
6. [HarleQuin](https://gitlab.sil.lab/tfplenum/tfplenum/-/pipeline_schedules/131/edit)
7. [Batman](https://gitlab.sil.lab/tfplenum/tfplenum/-/pipeline_schedules/99/edit)
8. [Aquaman](https://gitlab.sil.lab/tfplenum/tfplenum/-/pipeline_schedules/96/edit)
9. [Catwoman](https://gitlab.sil.lab/tfplenum/tfplenum/-/pipeline_schedules/94/edit)
10. [Deadshot](https://gitlab.sil.lab/tfplenum/tfplenum/-/pipeline_schedules/93/edit)
11. [Ghostrider](https://gitlab.sil.lab/tfplenum/tfplenum/-/pipeline_schedules/210/edit)
