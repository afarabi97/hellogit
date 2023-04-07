*** Settings ***
Resource    ../include/dipCommonVariables.resource
Resource    ../include/dipIndexMgmtVariables.resource
Variables   ../include/element_ids_frontend.py

Library     TFPlenumLibrary.py

*** Keywords ***
Close Indexes And Validate
    [Arguments]             @{application_list}
    [Documentation]         Validates the health status of an application
    ...                     after Closing the Applications Index.
    Set Selenium Speed      0.5s

    FOR  ${application_name}  IN  @{application_list}
        ${app_name_lower} =  Convert To Lower Case  ${application_name}
        ${shoot_text}=   Catenate  Index Management Page    -   ${application_name}

        Navigate To Index Management
        log     Application Name: \t ${application_name}

        click   ${CVAH_ELASTICSEARCH_INDEX_MANAGEMENT_MAT_SELECT_ACTION}
        click   ${locIndexMgmtActionCloseOption}
        escape  ${shoot_text} - Index Action - Close

        click    ${CVAH_ELASTICSEARCH_INDEX_MANAGEMENT_BUTTON_NEXT}    timeout=5s
        click   ${CVAH_ELASTICSEARCH_INDEX_MANAGEMENT_MAT_SELECT_LIST}
        clickElements   ${locIndexMgmtIndexListDropdownItemsTmpl}   timeout=10s  injector=${app_name_lower}
        escape  ${shoot_text} - Index List - Select

        click  ${CVAH_ELASTICSEARCH_INDEX_MANAGEMENT_BUTTON_UPDATE}    timeout=5s
        shoot  ${shoot_text} - Index Update

        Navigate To Health

        &{response_info_dict}=      Check App Packet Health  ${application_name}

        Should Be Equal    '${response_info_dict.is_healthy}'    'True'    msg=The App Must Be Healthy After Closing Indices Prior To Deletion    values=True    ignore_case=True    formatter=str

        log   The ${application_name} Application Is Healthy After Closing Indices Prior To Deletion
        shoot   ${shoot_text} - Successfully Closed Indices
    END

Backup And Close Indexes
    [Documentation]  Selects the "Backup and close" option on the Index Action form and selects all
    ...              index checkboxes from the Index List section.
    click  ${CVAH_ELASTICSEARCH_INDEX_MANAGEMENT_MAT_SELECT_ACTION}
    click  ${locIndexMgmtActionBackupAndCloseOption}
    click  ${CVAH_ELASTICSEARCH_INDEX_MANAGEMENT_BUTTON_NEXT}
    click  ${CVAH_ELASTICSEARCH_INDEX_MANAGEMENT_MAT_SELECT_LIST}
    ${index_name_list} =  Create List
    Wait Until Element Is Visible  xpath=//mat-option
    ${index_elements} =  Get WebElements  xpath=//mat-option
    FOR  ${element}  IN  @{index_elements}
        ${element_text} =  Get Text  ${element}
        ${name}  ${size} =  Split String  ${element_text}
        Append To List  ${index_name_list}  ${name}
        click  ${element}
    END
    Press Keys  None  ESCAPE
    log  ${index_name_list}
    click  ${CVAH_ELASTICSEARCH_INDEX_MANAGEMENT_BUTTON_UPDATE}
    Sleep  5s
    lookFor  Curator job submitted check notifications for progress.
    click  ${APP_TOP_NAVBAR__MAT_LIST_ITEM_NOTIFICATIONS_MAT_ICON}
    Wait Until Element Contains  ${locTopNotificationMsg}  Curator Backup Indices job completed.  2m
    Press Keys  None  ESCAPE  ESCAPE
