*** Variables ***
# Templated variables
# (default: '~' in fields to replace)
${tmplLocMipProvError}                             xpath=//tr[td[a[contains(text(),'~')]]]/td/cvah-node-state-progress-bar/a[2]/mat-icon[text()="cancel"]
${tmplLocMipDeployProgressBar}                     xpath=//tr[td[a[contains(text(),'~')]]]/td/cvah-node-state-progress-bar/a[3]/mat-icon[text()="check_circle"]
${tmplLocMipDeployError}                           xpath=//tr[td[a[contains(text(),'~')]]]/td/cvah-node-state-progress-bar/a[3]/mat-icon[text()="cancel"]

# Add MIP Dialog
${locMipMgmtAddMipBtn}                             xpath=//button[span[text()='Add MIP']]
${locMipHostnames}                                 xpath=//mat-card-content/table/tbody/tr/td/a
${locMipMgmtHostnameInput}                         xpath=//input[@formcontrolname="hostname"]
${locMipMgmtAddMipDialogIpAddressInput}            xpath=//cvah-unused-ipaddress-autocomplete-ctrl//mat-select
${locMipMgmtAddMipDialogIpAddressDropdownOpt1}     xpath=//mat-option[position()=1]/span
${locMipMgmtAddMipDialogVMRadioBtn}                xpath=//div[@class='mat-radio-container' and input[@value='Virtual']]
${locMipMgmtAddMipDialogSubmitBtn}                 xpath=//cvah-add-mip-dialog//button/span[text()="Add"]

${tmplDeleteMipBtn}                                 xpath=//tr[td[a[contains(text(),'~')]]]//button[@mattooltip='Delete MIP']