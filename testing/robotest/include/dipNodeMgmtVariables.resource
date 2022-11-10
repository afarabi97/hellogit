*** Variables ***
# Templated variables
# (default: '~' in fields to replace)
${tmplLocNodeMgmtProgressBar}                       xpath=//tr[td[a[contains(text(),'~')]]]/td/app-node-state-progress-bar/a[3]/mat-icon[text()="check_circle"]

# This is a special templated list variable
${tmplListLocRobotTestCleanupDeleteBtn}             xpath=//mat-card[2]//tr[td[a[contains(text(),'~')]]]//following-sibling::td[5]//button[@mattooltip='Delete Node']

# Element Locators
# Control Plane
${locSetupCPButton}                                 xpath=//button[./span[text()="Setup Control Plane"]]
${locCPDeployState}                                 xpath=//app-node-mng//mat-card[1]//app-node-state-progress-bar/a[3]/mat-icon

${locNodeMgmtAddNodeBtn}                            xpath=//button[span[text()='Add Node']]
${locNodeHostnames}                                 xpath=//mat-card[2]/mat-card-content/table/tbody/tr/td[1]/a
${locNodeMgmtHostnameInput}                         xpath=//input[@formcontrolname="hostname"]
${locNodeMgmtAddNodeDialogIpAddressInput}           xpath=//unused-ipaddress-autocomplete-ctrl//mat-select
${locNodeMgmtAddNodeDialogIpAddressDropdownOpt1}    xpath=//mat-option[position()=1]/span
${locNodeMgmtAddNodeDialogServerRadioBtn}           xpath=//mat-radio-button[@value='Server']
${locNodeMgmtAddNodeDialogSensorRadioBtn}           xpath=//mat-radio-button[@value='Sensor']
${locNodeMgmtAddNodeDialogServiceRadioBtn}          xpath=//mat-radio-button[@value='Service']
${locNodeMgmtAddNodeDialogVMRadioBtn}               xpath=//div[@class='mat-radio-container' and input[@value='Virtual']]
${locNodeMgmtAddNodeDialogSubmitBtn}                xpath=//*[contains(@id, "mat-dialog-")]/add-node-dialog/div/div[2]/button[2]

# Cleanup Locators
${locNodeMgmtAddNodeDoubleConfirmDeleteBtn}         xpath=//button[@id='cvah-confirm-dialog-button-options2-not-double-confirm']/span
