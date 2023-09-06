*** Variables ***
# Templated variables
# (default: '~' in fields to replace)
${tmplLocNodeProvProgressBar}                       xpath=//tr[td[a[contains(text(),'~')]]]/td/cvah-node-state-progress-bar/a[2]/mat-icon[text()="check_circle"]
${tmplLocNodeProvError}                             xpath=//tr[td[a[contains(text(),'~')]]]/td/cvah-node-state-progress-bar/a[2]/mat-icon[text()="cancel"]
${tmplLocNodeDeployProgressBar}                     xpath=//tr[td[a[contains(text(),'~')]]]/td/cvah-node-state-progress-bar/a[3]/mat-icon[text()="check_circle"]
${tmplLocNodeDeployError}                           xpath=//tr[td[a[contains(text(),'~')]]]/td/cvah-node-state-progress-bar/a[3]/mat-icon[text()="cancel"]

# Templated variable for delete node button
${tmplDeleteNodeBtn}                                xpath=//tr[td[a[contains(text(),'~')]]]//button[@mattooltip='Delete Node']

# Element Locators
# Control Plane
${locSetupCPButton}                                 xpath=//button[./span[text()="Setup Control Plane"]]
${locCPDeployState}                                 xpath=//cvah-node-mng//mat-card[1]//cvah-node-state-progress-bar/a[3]/mat-icon

${locDeployKitButton}                               xpath=//button[./span[text()="Deploy Kit"]]

# Add Node Dialog Locators
${locNodeMgmtAddNodeBtn}                            xpath=//button[span[text()='Add Node']]
${locNodeHostnames}                                 xpath=//mat-card-content/table/tbody/tr/td/a
${locNodeMgmtHostnameInput}                         xpath=//input[@formcontrolname="hostname"]
${locNodeMgmtAddNodeDialogIpAddressInput}           xpath=//cvah-unused-ipaddress-autocomplete-ctrl//mat-select
${locNodeMgmtAddNodeDialogIpAddressDropdownOpt1}    xpath=//mat-option[position()=1]/span
${tmplLocNodeMgmtAddNodeDialogRadioBtn}             xpath=//mat-radio-button[@value='~']
${locNodeMgmtAddNodeDialogVMRadioBtn}               xpath=//div[@class='mat-radio-container' and input[@value='Virtual']]
${locNodeDataDriveSizeInGbInput}                    xpath=//mat-form-field[div//mat-label[text()="Data Drive size in (GB)"]]//input
${locNodeMgmtAddNodeDialogSubmitBtn}                xpath=//cvah-add-node-dialog//button/span[text()="Add"]
${locNodeMgmtAddMipDialogSubmitBtn}                 xpath=//cvah-add-mip-dialog//button/span[text()="Add"]
