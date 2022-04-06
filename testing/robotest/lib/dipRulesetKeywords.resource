*** Settings ***
Resource    ../include/dipRulesetVariables.resource


*** Keywords ***
Edit Rule Set
    [Arguments]  ${rule_set_name}  ${reset}=${False}
    [Documentation]  Edits the specified Rule Set by assigning a sensor. The rule set state
    ...              should be "Dirty" upon completion of this keyword. If reest=True, the sensor
    ...              will be unassigned and the "Is Enabled?" will be unchecked.
    Navigate To Rulesets

    ${index} =  Get Rule Set Table Row Index  ${rule_set_name}
    ${locEditRuleSetBtn} =  Set Variable  id=cvah-policy-management-table-rule-set-td-${index}-actions-button-edit
    click  ${locEditRuleSetBtn}

    lookForElement  ${locAddRulesetDialogClassificationField}
    Element Should Contain  ${locAddRulesetDialogClassificationField}  Unclassified

    # Select a sensor. Unselects sensor if reset=True
    ${selected_sensor} =  Get Text  ${locAddRulesetSensorField}
    ${selected_sensor} =  Strip String  ${selected_sensor}
    ${sensor_name_len} =  Get Length  ${selected_sensor}
    IF  not ${reset} and ${sensor_name_len} == ${0} or ${reset} and ${sensor_name_len} > ${0}
        click  ${locAddRulesetSensorField}
        click  ${locAddRulesetSensorCheckbox}
        Press Keys  None  TAB
    END

    # Click "Is Enabled?" checkbox. Unchecks box if reset=True
    ${checkbox_input} =  Set Variable  id=rule-set-add-edit-div-mat-checkbox-is-enabled-input
    ${is_checked} =  Get Element Attribute  ${checkbox_input}  aria-checked
    IF  not ${reset} and '${is_checked}' == 'false' or ${reset} and '${is_checked}' == 'true'
        click  ${locAddRulesetIsEnabledcheckbox}
    END

    click  ${locAddRulesetSubmitBtn}
    reload
    ${locState} =  Set Variable  id=cvah-policy-management-table-rule-set-td-${index}-state
    lookForElement  ${locState}
    Element Should Contain  ${locState}  Dirty  # current state of rule set

Add Rule Set
    [Arguments]  ${rule_set_name}  ${rule_type}
    Navigate To Rulesets

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
    Element Should Not Contain  ${locState}  Synced

Delete Rule Set
    [Arguments]  ${rule_set_name}
    Navigate To Rulesets

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
    Navigate To Rulesets
    clickAndWaitOnEnable  ${locRuleSyncButton}
    reload
    lookForElement  ${locRuleSetTableStateElements}
    ${num_rule_sets} =  Get Element Count  ${locRuleSetTableStateElements}
    FOR  ${i}  IN RANGE  ${num_rule_sets}
        ${assigned_sensor} =  Get Text  id=cvah-policy-management-table-rule-set-td-${i}-assigned-sensors
        ${assigned_sensor} =  Strip String  ${assigned_sensor}
        ${sensor_name_len} =  Get Length  ${assigned_sensor}
        ${state_loc} =  Set Variable  id=cvah-policy-management-table-rule-set-td-${i}-state
        IF  ${sensor_name_len} > 0
            Element Should Contain  ${state_loc}  Synced
        ELSE
            Element Should Contain  ${state_loc}  Dirty
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


###################  Keywords for Rule Set State Machine  #######################
Set Ruleset Initial State
    [Arguments]         ${use_cached}=${True}
    [Documentation]     Gets The Rulesets State And Sets The Global Variable (suricata, zeek_script and zeek_signature)
    log     Set The Ruleset State Global Variable
    ${RULESETS_STATE}=      Get Rulesets State Machine      use_cached=${use_cached}
    Set Global Variable     ${RULESETS_STATE}
    log     Successfully Set The Ruleset State Global Variable: ${RULESETS_STATE}

Set Ruleset State
    [Documentation]     Gets the current_state of the Zeek Script Ruleset,
    ...                 Perform actions needed to reach the target_state
    [Arguments]  ${ruleset_type_key}   ${target_name}  ${target_clearance}=${ruleset_clearance_state}  ${target_state}=${ruleset_presync_state}  ${target_enabled}=${True}  ${target_sensors}=${True}  ${delete}=${False}   ${reset_state_after}=${False}
    # Set Ruleset State    ruleset_type_key=${zeek_script_ruleset_key}  target_state=${ruleset_presync_state}  target_name=${zeek_script_ruleset_name}   target_enabled=True   target_sensors=True  delete=${delete}

    ${rulesetExists}=   Does Ruleset Exist  ${ruleset_type_key}
    ${ruleset_type_string}=    Convert Ruleset Key To Robot String   ${ruleset_type_key}
    &{action_items}=     Create Dictionary   ${action_items_ruleset_type_key}=${ruleset_type_string}

    # Meat & Potatoes One
    IF      ${rulesetExists}
        # If the ruleset DOES exist: perform edit OR delete
        log     The ruleset DOES DOES exist: perform edit OR delete
        IF      ${delete}
            # The ruleset DOES exist AND we DO want to delete: perform a delete
            log     The ruleset DOES exist AND we DO want to delete: perform a delete
            Execute Ruleset State Change Action     ${DELETE_ACTION}    ${action_items}
        ELSE
            # The ruleset DOES exist AND we DO NOT want to delete: perform an edit
            log     The ruleset DOES exist AND we DO NOT want to delete: perform an edit

            # Determine whether or not each field is where we want it to be

            #  STATE
            ${isStateSynced}    ${synced_state_result}=  Is Ruleset Field Synchronized  ${ruleset_type_key}  ${ruleset_state_key}  ${target_state}
            Set To Dictionary   ${action_items}     ${ruleset_state_key}=${synced_state_result}
            log     synced_state_result: ${synced_state_result}

            # NAME
            ${isNameSynced}    ${synced_name_result}=  Is Ruleset Field Synchronized  ${ruleset_type_key}  ${ruleset_name_key}  ${target_name}
            Set To Dictionary   ${action_items}     ${ruleset_name_key}=${synced_name_result}
            log     synced_name_result: ${synced_name_result}

            # Clearance
            ${isClearanceSynced}    ${synced_clearance_result}=  Is Ruleset Field Synchronized  ${ruleset_type_key}  ${ruleset_clearance_key}  ${target_clearance}
            Set To Dictionary   ${action_items}     ${ruleset_clearance_key}=${synced_clearance_result}
            log     synced_clearance_result: ${synced_clearance_result}

            # ENABLED
            ${isEnabledSynced}    ${synced_enabled_result}=  Is Ruleset Field Synchronized  ${ruleset_type_key}  ${ruleset_enabled_key}  ${target_enabled}
            Set To Dictionary   ${action_items}     ${ruleset_enabled_key}=${synced_enabled_result}
            log     synced_enabled_result: ${synced_enabled_result}

            # AppType
            # uses ruleset_type_string to check, we should probably change this
            ${isAppTypeSynced}    ${synced_appType_result}=  Is Ruleset Field Synchronized  ${ruleset_type_key}  ${ruleset_appType_key}  ${ruleset_type_string}
            Set To Dictionary   ${action_items}     ${ruleset_appType_key}=${synced_appType_result}
            log     synced_appType_result: ${synced_appType_result}

            # SENSORS
            # This should return a list into 'synced_sensor_result'
            ${isSensorSynced}    ${synced_sensor_result}=  Is Ruleset Field Synchronized  ${ruleset_type_key}  ${ruleset_sensors_key}  ${target_sensors}
            Set To Dictionary   ${action_items}     ${ruleset_sensors_key}=${synced_sensor_result}
            log     synced_sensor_result: ${synced_sensor_result}

            IF      ${isStateSynced} and ${isNameSynced} and ${isClearanceSynced} and ${isEnabledSynced} and ${isAppTypeSynced} and ${isSensorSynced}
                log     Skipping State Change!
                log     The Rulesets State is already synced
            ELSE
                # Execute The Ruleset State Change Action (action=Edit)
                log     action_items (dict): ${action_items}
                Execute Ruleset State Change Action  ${EDIT_ACTION}  ${action_items}
            END
        END

    ELSE
        IF      ${delete}
            # The ruleset DOES NOT exist AND we DO want to delete: NO STATE CHANGE IS PERFORMED
            log     State Change Skipped! The Ruleset Has Already Been Deleted!
        ELSE
            # The ruleset DOES NOT exist AND we DO NOT want to delete: perform an add
            log     The ruleset DOES NOT exist AND we DO NOT want to delete: perform an add

            #  STATE
            ${isStateSynced}    ${synced_state_result}=  Is Ruleset Field Synchronized  ${ruleset_type_key}  ${ruleset_state_key}  ${target_state}
            Set To Dictionary   ${action_items}     ${ruleset_state_key}=${synced_state_result}
            log     synced_state_result: ${synced_state_result}

            # NAME
            ${isNameSynced}    ${synced_name_result}=  Is Ruleset Field Synchronized  ${ruleset_type_key}  ${ruleset_name_key}  ${target_name}
            Set To Dictionary   ${action_items}     ${ruleset_name_key}=${synced_name_result}
            log     synced_name_result: ${synced_name_result}

            # Clearance
            ${isClearanceSynced}    ${synced_clearance_result}=  Is Ruleset Field Synchronized  ${ruleset_type_key}  ${ruleset_clearance_key}  ${target_clearance}
            Set To Dictionary   ${action_items}     ${ruleset_clearance_key}=${synced_clearance_result}
            log     synced_clearance_result: ${synced_clearance_result}

            # ENABLED
            ${isEnabledSynced}    ${synced_enabled_result}=  Is Ruleset Field Synchronized  ${ruleset_type_key}  ${ruleset_enabled_key}  ${target_enabled}
            Set To Dictionary   ${action_items}     ${ruleset_enabled_key}=${synced_enabled_result}
            log     synced_enabled_result: ${synced_enabled_result}

            # AppType
            # uses ruleset_type_string to check, we should probably change this
            ${isAppTypeSynced}    ${synced_appType_result}=  Is Ruleset Field Synchronized  ${ruleset_type_key}  ${ruleset_appType_key}  ${ruleset_type_string}
            Set To Dictionary   ${action_items}     ${ruleset_appType_key}=${synced_appType_result}
            log     synced_appType_result: ${synced_appType_result}

            # SENSORS
            # This should return a list into 'synced_sensor_result'
            ${isSensorSynced}    ${synced_sensor_result}=  Is Ruleset Field Synchronized  ${ruleset_type_key}  ${ruleset_sensors_key}  ${target_sensors}
            Set To Dictionary   ${action_items}     ${ruleset_sensors_key}=${synced_sensor_result}
            log     synced_sensor_result: ${synced_sensor_result}

            Execute Ruleset State Change Action  ${ADD_ACTION}  ${action_items}
        END
    END

    IF      ${reset_state_after}
        # Reset the initial state in case we want to run multiple options
        log     Resetting The Initial State
        Set Ruleset Initial State       use_cached=${False}
    END

Execute Ruleset State Change Action
    [Arguments]     ${action}     ${action_items}
    [Documentation]     Enters the action items data into the the dialog based on the sync
    log         Executinng Ruleset State Change\n
    log         Action:\t\t${action}
    log         Action Items: ${action_items}
    log         Ruleset Type:\t ${action_items}[${action_items_ruleset_type_key}]

    # Ensure that we are on the ruleset page
    Navigate To Rulesets

    # Open the appropriate dialog button for the action
    Open ${action_items}[${action_items_ruleset_type_key}] Ruleset ${action} Dialog

    log     Synchronizing Ruleset Dialog Information
    log     dialog_info_keys: ${dialog_info_keys}
    shoot   Ruleset-Synchronization

    IF      '${action}' == '${DELETE_ACTION}'
        # Don't even go through the action_items, just delete
        log     Deleting The Ruleset
        click   ${locDeleteRulesetConfirm}
        log     Sucess! Deleted The Ruleset
        shoot   Ruleset-Synchronization
        reload
    ELSE
        # Determine if a piece of information needs to be synchronized
        # If the synced_state evalutates as False, we attempt to sync the info
        FOR  ${action_key}  IN  @{dialog_info_keys}
            IF      not ${action_items}[${action_key}][synced_state]
                log     The synced_state for action_key: ${action_key} is False
                log     Updating Information For Action Key ${action_key} Now
                Input Ruleset Dialog Information    ${action_key}   ${action_items}[${action_key}][target_state]
            END
        END

        # After inputting all the appropriate fields, Submit the ruleset information
        log             Submitting The Synchronized Dialog Information
        click           ${locAddRulesetSubmitBtn}
        log             Sucess! Finished Synchronizing Ruleset Dialog Information
        shoot           Ruleset-Synchronization
        reload
    END


Open ${ruleset_type} Ruleset ${ruleset_action} Dialog
    [Documentation]     Opens The Rulesets Edit Dialog For A Single Ruleset
    ...                 Assumes that we are on the Ruleset Page
    log     Opening The ${ruleset_action} Ruleset Dialog for ${ruleset_type}

    IF      '${ruleset_action}' == '${ADD_ACTION}'
        # The Add Button Is Static No Need To Inject
        # Click the add button to open the add dialog
        click   ${locRulesetActionAddButton}
    ELSE
        # The Delete and Edit Button are dynamic so we need to do an inject to get the locator
        ${lowered_ruleset_action}=  lower   ${ruleset_action}
        ${ruleset_action_btn}=  Inject  ${tmplLocRulesetActionButtonByType}  ${ruleset_type}  ${lowered_ruleset_action}

        click   ${ruleset_action_btn}
    END

    # Look for the Dialog Container
    lookForElement      ${locRulesetDialogContainer}

    # The Dialog Opening was successful
    log     Success! The ${ruleset_action} Ruleset Dialog for ${ruleset_type} has been opened!
    shoot   Opened ${ruleset_action} Dialog For The ${ruleset_type} Ruleset

Input Ruleset Dialog Information
    [Arguments]     ${action_key}   ${target_state}
    log     \nInputting Ruleset Dialog Info

    # The content field should always be visible at the start of this
    lookForElement      ${locRulesetAddEditDialogContainer}

    # Meat and potatoes two
    IF      '${action_key}' == '${ruleset_name_key}'
        log     Changing the rulesets name
        type    ${locAddRulesetNameInputField}   ${target_state}    ${True}
        shoot       Input-Ruleset-Dialog-Info-Name
        log         Successfully Changed the rulesets name\n
    ELSE IF     '${action_key}' == '${ruleset_clearance_key}'
        log         Changing the rulesets classification

        log         Injecting Classification: ${target_state}
        ${classification_item_element}=  Inject  ${tmplAddRulesetDialogClassificationByText}  ${target_state}

        click       ${locAddRulesetDialogClassificationField}
        click       ${classification_item_element}

        shoot       Input-Ruleset-Dialog-Info-Classification
        # log     Clicking The Overlay, No Dropdown Should Be Open Afterwards
        # click       ${locAddRulesetOverlayClick}
    ELSE IF     '${action_key}' == '${ruleset_appType_key}'
        log         Changing the rulesets rule type

        log     Injecting Rule Type: ${target_state}
        ${rule_type_item_element}=      Inject  ${tmplAddRulesetDialogRuleTypeByText}  ${target_state}

        click           ${locAddRulesetDialogRuleTypeField}
        click           ${rule_type_item_element}

        shoot       Input-Ruleset-Dialog-Info-Rule-Type
    ELSE IF     '${action_key}' == '${ruleset_sensors_key}'
        log     Changing the rulesets assigned sensors state
        # target state has the list of hostnames we are looking for
        shoot   Input-Ruleset-Dialog-Info-Sensors
        click   ${locAddRulesetDialogSensorField}   # Certified new locator
        shoot   Input-Ruleset-Dialog-Info-Sensors
        FOR     ${hostname}     IN  @{target_state}
            log     Injecting Sensor Hostname: ${hostname}
            ${sensor_checkbox_element}=     Inject  ${tmplAddRulesetDialogSensorCheckboxByText}    ${hostname}

            shoot   Input-Ruleset-Dialog-Info-Sensors
            click           ${sensor_checkbox_element}
            log             Sensor Select Button Was Checked
            shoot   Input-Ruleset-Dialog-Info-Sensors
        END

        log         Clicking The Overlay, No Dropdown Should Be Open Afterwards
        click       ${locAddRulesetOverlayClick}
        shoot       Input-Ruleset-Dialog-Info-Sensors
        log         Successfully Changed the rulesets assigned sensors state\n

    ELSE IF     '${action_key}' == '${ruleset_enabled_key}'
        log     Changing the rulesets enabled state

        click       ${locAddRulesetIsEnabledcheckbox}

        shoot       Input-Ruleset-Dialog-Info-Enabled
        log         Successfully Changed the rulesets enabled state\n
    END


Set ${ruleset} Ruleset To ${enabled_state} With ${all_or_no_sensors_assigned} Sensors Assigned
    IF          "${ruleset}" == "Zeek Scripts"
        ${type_key}  ${name_key}=    Set Variable     ${zeek_script_ruleset_key}     ${zeek_script_ruleset_name}
    ELSE IF     "${ruleset}" == "Zeek Signatures"
        ${type_key}  ${name_key}=    Set Variable  ${zeek_signature_ruleset_key}  ${zeek_signature_rulset_name}
    ELSE IF     "${ruleset}" == "Suricata"
        ${type_key}    ${name_key}=    Set Variable     ${suricata_ruleset_key}  ${suricata_ruleset_name}
    END

    IF          "${enabled_state}" == "Enabled"
        ${enabled}=     Set Variable    ${True}
    ELSE IF     "${enabled_state}" == "Disabled"
        ${enabled}=     Set Variable    ${False}
    END


    IF          "${all_or_no_sensors_assigned}" == "All"
        ${sensors_assigned}=     Set Variable    ${True}
    ELSE IF     "${all_or_no_sensors_assigned}" == "No"
        ${sensors_assigned}=        Set Variable    ${False}
    END

    Set Ruleset State    ruleset_type_key=${type_key}  target_state=${ruleset_presync_state}  target_name=${name_key}   target_enabled=${enabled}   target_sensors=${sensors_assigned}  delete=${False}

Set ${ruleset} Ruleset To ${enabled_state} With ${all_or_no_sensors_assigned} Sensors Assigned Then Reset State
    Set ${ruleset} Ruleset To ${enabled_state} With ${all_or_no_sensors_assigned} Sensors Assigned
    log     Resetting State
    Set Ruleset Initial State   use_cache=${False}


Set ${ruleset} Ruleset To Deleted
    IF          "${ruleset}" == "Zeek Signatures"
        ${type_key}  ${name_key}=    Set Variable  ${zeek_signature_ruleset_key}  ${zeek_signature_rulset_name}
    # ELSE IF     "${ruleset}" == "Zeek Signatures"
    #     ${type_key}  ${name_key}=    Set Variable  ${zeek_signature_ruleset_key}  ${zeek_signature_rulset_name}
    # ELSE IF     "${ruleset}" == "Suricata"
    #     ${type_key}    ${name_key}=    Set Variable     ${suricata_ruleset_key}  ${suricata_ruleset_name}
    END

    Set Ruleset State    ruleset_type_key=${type_key}  target_state=${ruleset_presync_state}  target_name=${name_key}  delete=${True}


Set ${ruleset} Ruleset To Deleted Then Reset State
    Set ${ruleset} Ruleset To Deleted
    log     Resetting State
    Set Ruleset Initial State   use_cache=${False}

Sync And Verify Rulesets
    log                     Syncing Rulesets..this could take a while
    Navigate To Rulesets
    shoot                   InitialRulesync
    clickAndWaitOnEnable    ${locRuleSyncButton}
    log                     Rulesync Successful
    shoot                   RulesyncSuccessful
    reload
