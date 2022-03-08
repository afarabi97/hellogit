*** Variables ***
# Templates
${tmplLocRulesetRowsByAppType}          xpath=//table['mat-table']/tbody/tr[contains(@class,'example-element-row')][./td[contains(@id,'type') and contains(text(), '~')]]
${tmplLocRulesetActionButtonByType}     xpath=//table['mat-table']/tbody/tr[contains(@class,'example-element-row')][./td[contains(@id,'type') and contains(text(), '~')]]/td[contains(@class,'mat-column-Actions')]/button[contains(@id,'actions-button-~')]

# Some have ruleset and some do not :shrug:
# We are calling it at two divs (/div/div) and we'll see how it goes
${tmplLocRulesetAddEditDialogInputSelector}    xpath=//mat-dialog-container/*[name()='cvah-policy-management-add-dialog']/div[(@mat-dialog-content) and not(@mat-dialog-actions)]/mat-form-field[@id='rule-set-add-edit-div-mat-form-field-~']/div/div

${tmpLocDialogSelector}                         xpath=//div[contains(@class,'mat-select-trigger')]//div[contains(@id,'mat-select-value')]/span[ancestor::mat-select[contains(@id,'~')]]
${tmplLocDialogSensorSelector}                  xpath=//mat-option[contains(@id, 'rule-set-add-edit-div-mat-form-field-sensors-mat-select-mat-option')][//span[contains(text(),'~')]]


${tmplLocDialogSelector}                  xpath=//mat-option[contains(@id, 'rule-set-add-edit-div-mat-form-field-~-mat-select-mat-option')][//span[contains(text(),'~')]]

${tmplLocDialogSelectorByText}
${tmplLocRulesetOptionByText}    xpath=//mat-option[contains(@id, 'rule-set-add-edit-div-mat-form-field') and contains(@id, 'mat-select-mat-option')]/span[@class='mat-option-text'][normalize-space(text())='~']

${locRulesetDialogContainer}            xpath=//mat-dialog-container

${locRulesetActionAddButton}            xpath=//button[@id='cvah-policy-management-button-add-ruleset']

${locRulesetAddEditDialogContainer}            xpath=//cvah-policy-management-add-dialog


${locRulesetDeleteDialogContainer}      xpath=//mat-dialog-container[./cvah-confirm-dialog[h1[text()='Remove Rule Set']]]
${locRulesetDialogContent}       xpath=//mat-dialog-container/*[contains(name(), 'cvah-policy-')]/div[(@mat-dialog-content) and not(@mat-dialog-actions)]


# START CERTIFIED NEW LOCATORS AND TEMPLATES
${locAddRulesetDialogSensorField}     xpath=//mat-select[@id='rule-set-add-edit-div-mat-form-field-sensors-mat-select']//div[contains(@class,'mat-select-value') and contains(@id,'mat-select-value')]
${tmplAddRulesetDialogSensorCheckboxByText}  xpath=//mat-option[contains(@id,'rule-set-add-edit-div-mat-form-field-sensors-mat-select-mat-option')]//mat-pseudo-checkbox[./following-sibling::span[@class='mat-option-text'][normalize-space()='~']]


${locAddRulesetDialogClassificationField}   xpath=//mat-select[@id='rule-set-add-edit-div-mat-form-field-classification-mat-select']//div[contains(@class,'mat-select-value') and contains(@id,'mat-select-value')]
${tmplAddRulesetDialogClassificationByText}    xpath=//mat-option[contains(@id,'rule-set-add-edit-div-mat-form-field-classification-mat-select-mat-option')]//span[@class='mat-option-text'][normalize-space()='~']


${locAddRulesetDialogRuleTypeField}         xpath=//mat-select[@id='rule-set-add-edit-div-mat-form-field-rule-type-mat-select']//div[contains(@class,'mat-select-value') and contains(@id,'mat-select-value')]
${tmplAddRulesetDialogRuleTypeByText}    xpath=//mat-option[contains(@id,'rule-set-add-edit-div-mat-form-field-rule-type-mat-select-mat-option')]//span[@class='mat-option-text'][normalize-space()='~']

${tmplAddDialogSensorCheckboxByTextIsChecked}  xpath=//mat-option[contains(@id,'rule-set-add-edit-div-mat-form-field-sensors-mat-select-mat-option')]//mat-pseudo-checkbox[./following-sibling::span[@class='mat-option-text'][normalize-space()='~']][contains(@class,'')][contains(@class,'mat-pseudo-checkbox-checked')]

${tmplAddDialogSensorCheckboxByTextIsNotChecked}  xpath=//mat-option[contains(@id,'rule-set-add-edit-div-mat-form-field-sensors-mat-select-mat-option')]//mat-pseudo-checkbox[./following-sibling::span[@class='mat-option-text'][normalize-space()='~']][contains(@class,'')][not(contains(@class,'mat-pseudo-checkbox-checked'))]
# END CERTIFIED NEW LOCATORS AND TEMPLATES



${locRulesetLookForAfterSelectClick}     xpath=//div[@class='cdk-overlay-connected-position-bounding-box']

# Individual Ruleset Keys
${ruleset_state_key}            ruleset_state
${ruleset_name_key}             ruleset_name
${ruleset_clearance_key}        ruleset_clearance
${ruleset_appType_key}          ruleset_appType
${ruleset_enabled_key}          ruleset_enabled
${ruleset_sensors_key}          ruleset_sensors
@{dialog_info_keys}             ${ruleset_name_key}  ${ruleset_clearance_key}   ${ruleset_appType_key}  ${ruleset_enabled_key}  ${ruleset_sensors_key}

${action_items_ruleset_type_key}    ruleset_type

# Rulesest Pre/Post-SyncStates
${ruleset_presync_state}        Dirty
${ruleset_postsync_state}       Synced

# Default states
${ruleset_clearance_state}      Unclassified

# Suricata Ruleset Key & Name
${suricata_ruleset_key}         suricata
${suricata_ruleset_name}        Emerging Threats

# Zeek Scripts Ruleset Key & Name
${zeek_script_ruleset_key}      zeek_script
${zeek_script_ruleset_name}     Zeek Sample Scripts

# Zeek Signatures Ruleset Key & Name
${zeek_signature_ruleset_key}   zeek_signature
${zeek_signature_rulset_name}   Zeek Integration Test Sample

${EDIT_ACTION}                  Edit
${ADD_ACTION}                   Add
${DELETE_ACTION}                Delete

${locDeleteRulesetConfirm}    xpath=//button[@id='cvah-confirm-dialog-button-options2-not-double-confirm']

# Normal
${locAddRulesetBtn}                   xpath=//button[@id='cvah-policy-management-button-add-ruleset']/span
${locRulesetActionEditBtnSuricata}    xpath=//button[@id='cvah-policy-management-table-rule-set-td-0-actions-button-edit']/span/em
${locRulesetActionEditBtnZeek}        xpath=//button[@id='cvah-policy-management-table-rule-set-td-1-actions-button-edit']/span/em

${locAddRulesetNameInputField}             id=rule-set-add-edit-div-mat-form-field-ruleset-name-input
${locAddRulesetClassificationField}        xpath=//*[@id="rule-set-add-edit-div-mat-form-field-classification-mat-select"]
${locAddRulesetUnclassifedSelectOption}    xpath=//mat-option/span[contains(text(), "Unclassified")]
${locAddRulesetRuletypeField}              xpath=//*[@id="rule-set-add-edit-div-mat-form-field-rule-type"]
${locAddRulesetRuletypeZeekSigOption}      xpath=//mat-option[@id='rule-set-add-edit-div-mat-form-field-rule-type-mat-select-mat-option-3']/span
${locAddRulesetSensorField}                xpath=//*[@id="rule-set-add-edit-div-mat-form-field-sensors-mat-select"]
${locAddRulesetSensorCheckbox}             id=rule-set-add-edit-div-mat-form-field-sensors-mat-select-mat-option-0

${locEditRulesetSensorCheckboxes}            xpath=//*[contains(@id,"rule-set-add-edit-div-mat-form-field-sensors-mat-select-mat-option")]

${locAddRulesetOverlayClick}         xpath=//div[3]/div[3]
${locAddRulesetIsEnabledcheckbox}    xpath=//mat-checkbox[@id='rule-set-add-edit-div-mat-checkbox-is-enabled']/label/div
${locAddRulesetSubmitBtn}            xpath=//button[@id='rule-set-add-edit-div-button-submit']/span
${locRuleSetTableNameElements}       xpath=//cvah-policy-management//table/tbody/tr/td[2]/a/span
${locRuleSetTableStateElements}      xpath=//cvah-policy-management//table/tbody/tr/td[5]
${locRuleSyncButton}                 id=cvah-policy-management-button-rule-sync

${locRemoveRsConfirmDialogMsg}       id=cvah-confirm-dialog-message
${locRemoveRsConfirmBtn}             id=cvah-confirm-dialog-button-options2-not-double-confirm

${locZeekIntegrationFolderDeleteBtn}        xpath=//button[@id='cvah-policy-management-table-rule-set-td-2-actions-button-delete']/span/em
${locZeekIntegrationFolderDeleteConfirm}    xpath=//button[@id='cvah-confirm-dialog-button-options2-not-double-confirm']

${locRulesetCleanupSuricataSubmitBn}         xpath=//button[@id='rule-set-add-edit-div-button-submit']/span


${zeek_script}    event zeek_(){\n\tprint "Hello, Integration Test World!";\n}\nevent zeek_done() {\n\tprint "Goodbye, Integration Test World!";\n}
${zeek_sig}       signature my-second-sig {\n\tip-proto == tcp\n\tdst-port == 80\n\tpayload /.*user/\n\tevent "Found user Number 1!"\n}

