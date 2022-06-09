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
