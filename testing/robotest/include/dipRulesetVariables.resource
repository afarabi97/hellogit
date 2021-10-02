*** Variables ***
${locAddRulesetBtn}                         xpath=//button[@id='cvah-policy-management-button-add-ruleset']/span
${locRulesetActionEditBtnSuricata}          xpath=//button[@id='cvah-policy-management-table-rule-set-td-0-actions-button-edit']/span/em
${locRulesetActionEditBtnZeek}              xpath=//button[@id='cvah-policy-management-table-rule-set-td-1-actions-button-edit']/span/em

${locAddRulesetNameInputField}              id=rule-set-add-edit-div-mat-form-field-ruleset-name-input
${locAddRulesetClassificationField}         xpath=//div[@id='mat-select-value-3']/span
${locAddRulesetUnclassifedSelectOption}     xpath=//mat-option[@id='rule-set-add-edit-div-mat-form-field-classification-mat-select-mat-option-0']/span
${locAddRulesetRuletypeField}               xpath=//div[@id='mat-select-value-5']/span
${locAddRulesetRuletypeZeekSigOption}       xpath=//mat-option[@id='rule-set-add-edit-div-mat-form-field-rule-type-mat-select-mat-option-3']/span
${locAddRulesetSensorField}                 xpath=//div[@id='mat-select-value-7']/span
${locAddRulesetSensorCheckbox}              id=rule-set-add-edit-div-mat-form-field-sensors-mat-select-mat-option-0


# ${locAddRulesetSensorCheckbox}              xpath=//mat-option[@id='rule-set-add-edit-div-mat-form-field-sensors-mat-select-mat-option-0']/mat-pseudo-checkbox
# ${locAddRulesetSensorCheckbox}              xpath=//mat-option[@id='rule-set-add-edit-div-mat-form-field-sensors-mat-select-mat-option-0']/span
${locAddRulesetOverlayClick}                xpath=//div[3]/div[3]
${locAddRulesetIsEnabledcheckbox}           xpath=//mat-checkbox[@id='rule-set-add-edit-div-mat-checkbox-is-enabled']/label/div
${locAddRulesetSubmitBtn}                   xpath=//button[@id='rule-set-add-edit-div-button-submit']/span

${locRuleSyncButton}                        id=cvah-policy-management-button-rule-sync


# xpath=//button[@id='cvah-policy-management-table-rule-set-td-2-actions-button-delete']/span/em
${locZeekIntegrationFolderDeleteBtn}        xpath=//button[@id='cvah-policy-management-table-rule-set-td-2-actions-button-delete']/span/em
${locZeekIntegrationFolderDeleteConfirm}    xpath=//button[@id='cvah-confirm-dialog-button-options2-not-double-confirm']/span

${zeek_script}                              event zeek_(){\n\tprint "Hello, Integration Test World!";\n}\nevent zeek_done() {\n\tprint "Goodbye, Integration Test World!";\n}
${zeek_sig}                                 signature my-second-sig {\n\tip-proto == tcp\n\tdst-port == 80\n\tpayload /.*user/\n\tevent "Found user Number 1!"\n}
