*** Settings ***
Resource    ../include/dipCommonVariables.resource
Resource    ../include/dipIndexMgmtVariables.resource

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

        click   ${locIndexMgmtIndexActionDropdown}
        click   ${locIndexMgmtIndexActionDropdownCloseItem}
        escape  ${shoot_text} - Index Action - Close

        click    ${locIndexMgmtIndexActionBtnTmpl}    timeout=5s    injector=next
        click   ${locIndexMgmtIndexListDropdown}
        clickElements   ${locIndexMgmtIndexListDropdownItemsTmpl}   timeout=10s  injector=${app_name_lower}
        escape  ${shoot_text} - Index List - Select

        click  ${locIndexMgmtIndexActionBtnTmpl}    timeout=5s   injector=update
        shoot  ${shoot_text} - Index Update

        Navigate To Health

        &{response_info_dict}=      Check App Packet Health  ${application_name}

        Should Be Equal    '${response_info_dict.is_healthy}'    'True'    msg=The App Must Be Healthy After Closing Indices Prior To Deletion    values=True    ignore_case=True    formatter=str

        log   The ${application_name} Application Is Healthy After Closing Indices Prior To Deletion
        shoot   ${shoot_text} - Successfully Closed Indices
    END


