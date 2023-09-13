*** Settings ***
Resource    ../include/dipRulesetVariables.resource


*** Keywords ***
Edit Rule Set
    [Arguments]  ${rule_set_name}
    [Documentation]  Edits the specified Rule Set by assigning a sensor. The rule set state
    ...              should be "Dirty" upon completion of this keyword. If reest=True, the sensor
    ...              will be unassigned and the "Is Enabled?" will be unchecked.
    Navigate To Rule Set

    ${index} =  Get Rule Set Table Row Index  ${rule_set_name}
    ${locEditRuleSetBtn} =  Set Variable  id=cvah-policy-management-table-rule-set-td-${index}-actions-button-edit
    click  ${locEditRuleSetBtn}

    lookForElement  ${locAddRulesetDialogClassificationField}
    Element Should Contain  ${locAddRulesetDialogClassificationField}  Unclassified

    # Select a sensor
    ${selected_sensor} =  Get Text  ${locAddRulesetSensorField}
    ${selected_sensor} =  Strip String  ${selected_sensor}
    ${sensor_name_len} =  Get Length  ${selected_sensor}
    IF  ${sensor_name_len} == ${0}
        click  ${locAddRulesetSensorField}
        click  ${locAddRulesetSensorCheckbox}
        Press Keys  None  TAB
    END

    # Click "Is Enabled?" checkbox
    ${checkbox_input} =  Set Variable  id=rule-set-add-edit-div-mat-checkbox-is-enabled-input
    ${is_checked} =  Get Element Attribute  ${checkbox_input}  aria-checked
    IF  '${is_checked}' == 'false'
        click  ${locAddRulesetIsEnabledcheckbox}
    END

    click  ${locAddRulesetSubmitBtn}
    reload
    ${locState} =  Set Variable  id=cvah-policy-management-table-rule-set-td-${index}-state
    lookForElement  ${locState}
    Element Should Contain  ${locState}  Dirty  # current state of edited rule set before sync

Add Rule Set
    [Arguments]  ${rule_set_name}  ${rule_type}
    Navigate To Rule Set

    ${rs_exists} =  Check If Rule Set Exists  ${rule_set_name}
    IF  ${rs_exists}
        log  Rule Set with name "${rule_set_name}" already exists.
        Return From Keyword
    END

    click  ${locRulesetActionAddButton}
    type  ${locAddRulesetNameInputField}  ${rule_set_name}
    click  ${locAddRulesetClassificationField}
    click  ${locAddRulesetUnclassifedSelectOption}
    click  ${locAddRulesetRuletypeField}
    click  xpath=//mat-option/span[contains(text(), "${rule_type}")]
    click  ${locAddRulesetSensorField}
    click  ${locAddRulesetSensorCheckbox}
    Press Keys  None  TAB
    click  ${locAddRulesetSubmitBtn}
    reload
    ${index} =  Get Rule Set Table Row Index  ${rule_set_name}
    ${locState} =  Set Variable  id=cvah-policy-management-table-rule-set-td-${index}-state
    lookForElement  ${locState}
    Element Should Contain  ${locState}  Created  # current state of new rule set before edit or sync

Delete Rule Set
    [Arguments]  ${rule_set_name}
    Navigate To Rule Set

    ${rs_exists} =  Check If Rule Set Exists  ${rule_set_name}
    IF  not ${rs_exists}
        log  Rule Set with name "${rule_set_name}" does not exist. Skipping "Delete Rule Set" keyword.
        Return From Keyword
    END

    ${index} =  Get Rule Set Table Row Index  ${rule_set_name}
    ${locDeleteBtn} =  Set Variable  id=cvah-policy-management-table-rule-set-td-${index}-actions-button-delete
    click  ${locDeleteBtn}
    Wait Until Element Contains  ${locRemoveRsConfirmDialogMsg}  ${rule_set_name}
    click  ${locRemoveRsConfirmBtn}
    ${rs_exists} =  Check If Rule Set Exists  ${rule_set_name}
    Should Not Be True  ${rs_exists}

Sync Rules
    log  Syncing Rulesets..this could take a while
    Navigate To Rule Set
    clickAndWaitOnEnable  ${locRuleSyncButton}
    lookForElement  ${locRuleSetTableStateElements}
    ${num_rule_sets} =  Get Element Count  ${locRuleSetTableStateElements}
    FOR  ${i}  IN RANGE  ${num_rule_sets}
        ${assigned_sensor} =  Get Text  id=cvah-policy-management-table-rule-set-td-${i}-assigned-sensors
        ${assigned_sensor} =  Strip String  ${assigned_sensor}
        ${sensor_name_len} =  Get Length  ${assigned_sensor}
        ${state_loc} =  Set Variable  id=cvah-policy-management-table-rule-set-td-${i}-state
        ${sensor_states_loc} =  Set Variable  id=cvah-policy-management-table-rule-set-td-${i}-sensor-states
        ${expansion_rules_table} =  Set Variable  id=cvah-policy-management-table-rule-set-td-${i}-rule-set-name-a-em-chevron-right
        Check For Snack Bar Container
        click  ${expansion_rules_table}
        ${count} =  Get Element Count  xpath=//table[contains(@class,'mat-table')]
        ${count} =  Evaluate  ${count} - 1
        log  Count: ${count} Assigned Sensor Length: ${sensor_name_len}
        IF  (${count} > 0) and (${sensor_name_len} > 0)
            Element Should Contain  ${state_loc}  Synced
            Element Should Contain  ${sensor_states_loc}  Synced
        ELSE IF  (${count} == 0) and (${sensor_name_len} > 0)
            Element Should Contain  ${state_loc}  Error
            Element Should Contain  ${sensor_states_loc}  Error
        ELSE IF  (${count} > 0) and (${sensor_name_len} == 0)
            Element Should Contain  ${state_loc}  Error
            Element Should Contain  ${sensor_states_loc}  ${EMPTY}
        ELSE
            Element Should Contain  ${state_loc}  Error
            Element Should Not Contain  ${sensor_states_loc}  ${EMPTY}
        END
    END
    log  Rulesync Successful

Upload Rules File
    [Arguments]  ${rule_set_name}  ${rules_file_name}
    [Documentation]  Robot Framework cannot upload file via OS GUI because it's running in a container,
    ...              so this keyword needs to use a backend API call to upload the rules file to the Rule Set.
    Upload Rule  ${rule_set_name}  ${rules_file_name}
    ${i} =  Get Rule Set Table Row Index  ${rule_set_name}
    click  xpath=//*[@id="cvah-policy-management-table-rule-set-td-${i}-rule-set-name-a"]
    Wait Until Page Contains  mal_md5_robot_1.txt  30s
    Wait Until Page Contains  mal_md5_robot_2.txt  30s
    Wait Until Page Contains  mal_md5_robot_3.txt  30s
    Wait Until Page Contains  mal_md5_robot_4.txt  30s
    Wait Until Page Contains  mal_md5_robot_5.txt  30s
    log  All rules file has been uploaded successfully.
    shoot  zeek_intel_rule_files_uploaded

# HELPER KEYWORDS
Check If Rule Set Exists
    [Arguments]  ${rs_name}
    [Documentation]  Returns true if Robot is able to locate the index of the Rule Set
    ${rs_index} =  Get Rule Set Table Row Index  ${rs_name}
    Return From Keyword If  ${rs_index} > ${-1}  ${TRUE}
    [Return]  ${FALSE}

Get Rule Set Table Row Index
    [Arguments]  ${target_rule_set}
    [Documentation]  Returns the index position of the rule set if it exists.
    ...              If rule set does not exist, the value of -1 will be return.
    Sleep  2s
    lookForElement  ${locRuleSetTableNameElements}
    ${rule_set_names} =  Get WebElements  ${locRuleSetTableNameElements}
    ${index} =  Set Variable  ${0}
    FOR  ${name}  IN  @{rule_set_names}
        ${name_text} =  Get Text  ${name}
        Return From Keyword If  '${name_text}' == '${target_rule_set}'  ${index}
        ${index} =  Set Variable  ${index+1}
    END
    [Return]  ${-1}
