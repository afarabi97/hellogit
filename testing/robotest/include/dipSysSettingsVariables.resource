*** Variables ***
# VMware Settings
${locVmwareSettingsSec}     xpath=//app-vmware-settings//a[./span[text()="VMware Settings"]]
${locVMwareIPAddress}       xpath=//app-vmware-settings//input[@formcontrolname="ip_address"]
${locVMwareUsername}        xpath=//app-vmware-settings//input[@formcontrolname="username"]
${locVMwarePassword}        xpath=//app-vmware-settings//input[@formcontrolname="password"]
${locRetypePWInput}         xpath=//app-vmware-settings//input[@formcontrolname="re_password"]
${locTestConnectionBtn}     xpath=//button[.//span[text()="Test Connection"]]
${locDatastoreSelect}       xpath=//app-vmware-settings//mat-select[@formcontrolname="datastore"]
${locDatastore1Option}      xpath=//mat-option[.//span[text() = 'datastore1']]
${locDevVsanOption}         xpath=//mat-option[.//span[text() = 'DEV-vSAN']]
${locPortgroupSelect}       xpath=//app-vmware-settings//mat-select[@formcontrolname="portgroup"]
${locInternalOptionSS}      xpath=//*[contains(@id, "cdk-overlay-")]//*[text() = 'Internal']
${locVcenterCheckbox}       xpath=//mat-checkbox[@formcontrolname="vcenter"]
${locClusterSelect}         xpath=//mat-select[@formcontrolname="cluster"]
${locDevClusterOption}      xpath=//mat-option/span[text() = 'DEV_Cluster']
${locDataCenterSelect}      xpath=//mat-select[@formcontrolname="datacenter"]
${locDevDatacenterOption}   xpath=//*[contains(@id, "cdk-overlay-")]//*[text() = 'DEV_Datacenter']
${locFolderSelect}          xpath=//app-vmware-settings//div[2]//mat-form-field[5]//mat-select
${locVMwareSaveButton}      xpath=//app-vmware-settings//button[.//span[text()="Save"]]

# General Settings
${locGeneralSettingsSec}    xpath=//app-general-settings-pane//a[./span[text()="General Settings"]]
${locDomainInputSS}         xpath=//input[@formcontrolname="domain"]
${locDhcpRangeSelect}       xpath=//mat-select[@formcontrolname="dhcp_range"]
${locDhcpFirstOption}       xpath=//*[contains(@id, "cdk-overlay-")]//mat-option[1]
${locGeneralSaveButton}     xpath=//app-general-settings-pane//button[.//span[text()="Save"]]
${locGenOpenConsoleBtn}     xpath=//app-general-settings-pane//button[.//span[text()="Open Console"]]

# Kit Settings
${locKitSettingsSec}        xpath=//app-kit-settings-pane//a[./span[text()="Kit Settings"]]
${locKitPasswordInput}      xpath=//app-kit-settings-pane//input[@formcontrolname="password"]
${locKitRetypePWInput}      xpath=//app-kit-settings-pane//input[@formcontrolname="re_password"]
${locUpstreamDnsServer}     xpath=//app-kit-settings-pane//input[@formcontrolname="upstream_dns"]
${locUpstreamNtpServer}     xpath=//app-kit-settings-pane//input[@formcontrolname="upstream_ntp"]
${locKSRSelect}             xpath=//mat-select[@formcontrolname="kubernetes_services_cidr"]
${locKSRFirstOption}        xpath=//*[contains(@id, "cdk-overlay-")]//mat-option[1]
${locKitSaveButton}         xpath=//app-kit-settings-pane//button[.//span[text()="Save"]]
${locKitOpenConsoleBtn}     xpath=//app-kit-settings-pane//button[.//span[text()="Open Console"]]

# MIP Settings
${locMipSettingsSec}        xpath=//app-mip-settings-pane//a[./span[text()="MIP Settings"]]
${locRootPasswordInputSS}   xpath=//app-mip-settings-pane//input[@formcontrolname="password"]
${locRootRetypePassword}    xpath=//app-mip-settings-pane//input[@formcontrolname="re_password"]
${locUserPasswordInput}     xpath=//app-mip-settings-pane//input[@formcontrolname="user_password"]
${locUserRetypePassword}    xpath=//app-mip-settings-pane//input[@formcontrolname="user_re_password"]
${locLuksPasswordInput}     xpath=//app-mip-settings-pane//input[@formcontrolname="luks_password"]
${locLuksRetypePassword}    xpath=//app-mip-settings-pane//input[@formcontrolname="luks_re_password"]
${locMipSaveButton}         xpath=//app-mip-settings-pane//button[.//span[text()="Save"]]