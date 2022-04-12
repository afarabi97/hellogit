*** Variables ***
# List locators (can be used for tmpl injection)
${listLocNodeMgmtProgressBars}                      xpath=//app-node-state-progress-bar
${listLocNodeMgmtTableRows}                         xpath=//mat-card[2]//table[@role='grid']/tbody/tr['mat-column-hostname']
${listLocRobotTestTableRows}                        xpath=//mat-card[2]//table[@role='grid']/tbody/tr['mat-column-hostname']/td[1]/a[contains(text(),'robottest')]

# Templated variables
# (default: '~' in fields to replace)
${tmplTextnodeMgmtAddNodeHostname}                  robottest-node-~
${tmplLocNodeMgmtProgressBar}                       //tr[~]/td/app-node-state-progress-bar/a[3]/mat-icon[text()="check_circle"]

# This is a special templated list variable
${tmplListLocRobotTestCleanupDeleteBtn}             xpath=//mat-card[2]//table[@role='grid']//tbody//tr['mat-column-hostname' and td[position()=1 and a[contains(text(),'~')]]]//following-sibling::td[5]//button[@mattooltip='Delete Node']

# Text & Time variables
${txtNodeMgmtAddNodeDialogInitialIpAddress}         1
${nodeMgmtAddNodeWaitTime}                          30m

# Element Locators
${locNodeMgmtAddNodeBtn}                            xpath=//button[span[text()='Add Node']]
${locNodeMgmtTable}                                 xpath=//table[@class='mat-table cdk-table']/tbody/tr
${locNodeMgmtHostnameInput}                         xpath=//input[@formcontrolname="hostname"]
${locNodeMgmtAddNodeDialogIpAddressInput}           xpath=//input[@data-placeholder="Enter your node IP address here"]
${locNodeMgmtAddNodeDialogIpAddressDropdownOpt1}    xpath=//mat-option[position()=1]/span
${locNodeMgmtAddNodeDialogSensorRadioBtn}           xpath=//mat-radio-button[@value='Sensor']
${locNodeMgmtAddNodeDialogVMRadioBtn}               xpath=//div[@class='mat-radio-container' and input[@value='Virtual']]
${locNodeMgmtAddNodeDialogSubmitBtn}                xpath=//*[contains(@id, "mat-dialog-")]/add-node-dialog/div/div[2]/button[2]

# Cleanup Locators
${locNodeMgmtAddNodeDoubleConfirmDeleteBtn}         xpath=//button[@id='cvah-confirm-dialog-button-options2-not-double-confirm']/span
