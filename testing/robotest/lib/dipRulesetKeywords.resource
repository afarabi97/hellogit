*** Settings ***
Resource    ../include/dipRulesetVariables.resource

Library     SeleniumLibrary     15s
Library     SSHLibrary          15s
Library     String

*** Keywords ***
Edit ${ruleset} Ruleset
    Navigate To Rulesets
    shoot           Initial${ruleset}RulesetPage
    Run Keyword if          '${ruleset}' == 'Zeek'  Run Keywords    log     Editing ${ruleset} Ruleset
    ...     AND     click   ${locRulesetActionEditBtnZeek}
    ...     AND     log  Opened Dialog Box For ${ruleset} Ruleset
    Run Keyword if          '${ruleset}' == 'Suricata'      Run Keywords    log  Editing ${ruleset} Ruleset
    ...     AND     click  ${locRulesetActionEditBtnSuricata}
    ...     AND     log  Opened Dialog Box For ${ruleset} Ruleset

    click           ${locAddRulesetSensorField}
    click           ${locAddRulesetSensorCheckbox}
    log             Attempting To Click Ruleset Overlay
    click           ${locAddRulesetOverlayClick}
    log             Sensor Select Button Was Checked

    Run Keyword if      '${ruleset}' == 'Zeek'  Run Keywords    log     Enabling ${ruleset} Ruleset
    ...     AND     click           ${locAddRulesetIsEnabledcheckbox}
    ...     AND     log             The ${ruleset} Ruleset has been enabled

    click           ${locAddRulesetSubmitBtn}
    shoot           Edit${ruleset}Ruleset
    log             ${ruleset} Ruleset was edited successfully
    reload

Add Integration Ruleset
    log             Attempting To Add A Zeek Script Ruleset Folder
    Navigate To Rulesets
    shoot           InitialIntegrationRulesetPage

    click           ${locAddRulesetBtn}
    shoot           AddRulesetInitial
    click           ${locAddRulesetNameInputField}
    type            ${locAddRulesetNameInputField}    Zeek Sample Test Integration Signatures
    log             Attempting to find Classification Field
    shoot           RulesetNameInput
    click           ${locAddRulesetClassificationField}
    log             Attempting to find Unclassified Option
    click           ${locAddRulesetUnclassifedSelectOption}
    log             Attempting to find Ruletype Field
    click           ${locAddRulesetRuletypeField}
    log             Attempting to find & click Zeek Signatures Option
    click           ${locAddRulesetRuletypeZeekSigOption}
    log             Attempting to find Sensor Field & Sensor Checkbox

    # I have no idea why this requires a mouse over and a click without a search for the element
    Mouse Over      ${locAddRulesetSensorField}
    Click Element   ${locAddRulesetSensorField}

    shoot           SensorFieldClicked
    click           ${locAddRulesetSensorCheckbox}
    log             Sensor Select Button Was Checked...
    click           ${locAddRulesetOverlayClick}
    click           ${locAddRulesetSubmitBtn}
    log             The ruleset was added!
    shoot           AddRuleset
    reload

Sync And Verify Rulesets
    log                     Syncing Rulesets..this could take a while
    Navigate To Rulesets
    shoot                   InitialRulesync
    clickAndWaitOnEnable    ${locRuleSyncButton}
    log                     Rulesync Successful
    shoot                   RulesyncSuccessful
    reload

Cleanup Zeek Signature Ruleset Files
    Navigate To Rulesets
    log     Deleting the Zeek Integration Test Folder
    click   ${locZeekIntegrationFolderDeleteBtn}
    click   ${locZeekIntegrationFolderDeleteConfirm}
    shoot   DeleteZeekIntegrationTestFolder
    reload

Cleanup Zeek Script Ruleset Files
    Navigate To Rulesets
    # store    xpath=//button[@id='cvah-policy-management-table-rule-set-td-1-actions-button-edit']/span/em    locSampleScriptsEditBtn
    click  xpath=//button[@id='cvah-policy-management-table-rule-set-td-1-actions-button-edit']/span/em
    # click   xpath=//button[@id='cvah-policy-management-table-rule-set-td-1-actions-button-edit']/span/em
    # store    id=mat-select-value-9    locSampleScriptsSensorBtn
    click  xpath=//div[@id='mat-select-value-7']/span/span
    # click   xpath=//div[@id='mat-select-value-7']/span/span
    # store    xpath=//mat-option[@id='rule-set-add-edit-div-mat-form-field-sensors-mat-select-mat-option-0']/span    locSampleScriptsSenserOption
    click   xpath=//mat-option[@id='rule-set-add-edit-div-mat-form-field-sensors-mat-select-mat-option-0']/span
    click   xpath=//div[3]/div[3]

    # store    xpath=//mat-checkbox[@id='rule-set-add-edit-div-mat-checkbox-is-enabled']/label/div    locSampleScriptIsEnabledBtn
    click   xpath=//mat-checkbox[@id='rule-set-add-edit-div-mat-checkbox-is-enabled']/label/div
    # store    xpath=//button[@id='rule-set-add-edit-div-button-submit']/span    locSampleScriptSubmitBtn
    click   xpath=//button[@id='rule-set-add-edit-div-button-submit']/span
    log     Zeek Sample Scripts Edited!
    reload

Cleanup Suricata Ruleset Files
    Navigate To Rulesets
    log     Clicking Suricata Edit Button
    click    xpath=//button[@id='cvah-policy-management-table-rule-set-td-0-actions-button-edit']/span/em
    log     Clicking Suricata Edit Sensor Button
    click   xpath=//div[@id='mat-select-value-7']/span/span
    # store    xpath=//mat-option[@id='rule-set-add-edit-div-mat-form-field-sensors-mat-select-mat-option-0']/span    locSampleScriptsSenserOption
    log     Clicking Suricata Sensor Option
    click   xpath=//mat-option[@id='rule-set-add-edit-div-mat-form-field-sensors-mat-select-mat-option-0']/span
    click   xpath=//div[3]/div[3]
    # store    xpath=//button[@id='rule-set-add-edit-div-button-submit']/span    locSampleScriptSubmitBtn
    log     Clicking Suricata Submit Button
    click   xpath=//button[@id='rule-set-add-edit-div-button-submit']/span
    log     Ruleset ready for syncing
    reload
