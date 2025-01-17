*** Settings ***
Resource    ../include/dipCommonVariables.resource
Variables   ../include/element_ids_frontend.py

Library     Loggy.py            ${CATEGORY}    WITH NAME    loggy_obj
Library     SeleniumLibrary     15s    run_on_failure= loggy_obj.failure
Library     SSHLibrary          15s
Library     String
Library     Collections
Library     TFPlenumLibrary.py


*** Keywords ***
Get Initial Kit Password
    [Documentation]  Gets the initial kit password when DIP kit is built from the CI/CD pipeline
    ${file_content} =  Execute Command  cat /opt/tfplenum/core/playbooks/inventory/kit_settings.yml
    @{lines} =  Split String  ${file_content}  \n
    FOR  ${line}  IN  @{lines}
        ${length} =  Get Length  ${line}
        IF  ${length} > 0
            ${stripped_line} =  Strip String  ${line}
            ${not_comment} =  Evaluate  '${stripped_line[0]}' != '#'
            ${contains_pw} =  Evaluate  'root_password' in '${stripped_line}'
            IF  ${not_comment} and ${contains_pw}
                ${kit_pw} =  Remove String  ${stripped_line}  root_password: "  "
                Return From Keyword  ${kit_pw}
            END
        END
    END

Check SSH Connection For All Nodes
    [Arguments]  ${ssh_pw}
    &{nodes_list} =  Get Nodes
    ${node_tuples} =  Get Dictionary Values  ${nodes_list}  # (ip_address, node_type)
    FOR  ${node}  IN  @{node_tuples}
        IF  '${node[1]}' != 'MIP'
            Open Connection  ${node[0]}
            Login            ${host_username}  ${ssh_pw}
            log  Successfully logged into node with IP address ${node[0]}
            Close Connection
        END
    END

Perform Steps For Changing Kit Password
    [Arguments]  ${new_kit_pw}
    Set Selenium Speed  0.5s
    Navigate To Tools
    click  ${locChangeKitPassExp}
    type  ${CVAH_CHANGE_PASSWORD_FORM__NEW_ROOT_PASSWORD_INPUT}  ${new_kit_pw}
    type  ${CVAH_CHANGE_PASSWORD_FORM__RETYPE_PASSWORD_INPUT}  ${new_kit_pw}
    Wait Until Element Is Enabled  ${CVAH_CHANGE_PASSWORD_FORM__BUTTON_UPDATE}
    click  ${CVAH_CHANGE_PASSWORD_FORM__BUTTON_UPDATE}
    click  ${CVAH_CONFIRM_DIALOG__BUTTON_OPTIONS2_NOT_DOUBLE_CONFIRM}
    lookFor  Successfully changed the password of your Kit!

Get Elastic License Expiration
    click  ${CVAH_UPDATE_ES_LICENSE_FORM__MAT_EXPANSION_PANEL}
    Sleep  2s
    Wait Until Element Is Visible  ${CVAH_UPDATE_ES_LICENSE_FORM__LICENSE_EXPIRE_DATE}
    ${license_exp_date} =  Get Text  ${CVAH_UPDATE_ES_LICENSE_FORM__LICENSE_EXPIRE_DATE}
    # EXAMPLE: "Curent License Expiration: November 29, 2023 at 5:59:59 PM GMT-6"
    ${pre}  ${date} =  Split String  ${license_exp_date}  :  1
    ${date} =  Fetch From Left  ${date}  GMT
    ${date} =  Strip String  ${date}
    # Should now just be: "November 29, 2023 at 5:59:59 PM"
    ${exp_date} =  Convert Date  ${date}  date_format=%B %d, %Y at %I:%M:%S %p
    [Return]  ${exp_date}

Compare License Backend Data To UI
    [Arguments]  ${backend_el_info_dict}
    ${backend_el_type} =  Get From Dictionary  ${backend_el_info_dict}  type
    ${backend_el_status} =  Get From Dictionary  ${backend_el_info_dict}  status
    ${backend_el_exp} =  Get From Dictionary  ${backend_el_info_dict}  expiration
    ${backend_el_exp} =  Replace String  ${backend_el_exp}  search_for=T  replace_with=${SPACE}
    ${backend_el_exp} =  Fetch From Left  ${backend_el_exp}  .

    ${frontend_el_exp_date} =  Get Elastic License Expiration
    ${frontend_el_type} =  Get Text  ${CVAH_UPDATE_ES_LICENSE_FORM__LICENSE_TYPE}
    Should Contain  ${frontend_el_type}  Curent License Type:
    ${frontend_el_type} =  Fetch From Right  ${frontend_el_type}  :
    ${frontend_el_status} =  Get Text  ${CVAH_UPDATE_ES_LICENSE_FORM__LICENSE_STATUS}
    Should Contain  ${frontend_el_status}  Curent License Status:
    ${frontend_el_status} =  Fetch From Right  ${frontend_el_status}  :

    Should Be Equal As Strings  ${backend_el_type}  ${frontend_el_type}  ignore_case=True  strip_spaces=True
    Should Be Equal As Strings  ${backend_el_status}  ${frontend_el_status}  ignore_case=True  strip_spaces=True
    ${time_diff} =  Subtract Date From Date  ${backend_el_exp}  ${frontend_el_exp_date}
    Should Be True  ${time_diff} == 0

Upload Elastic License
    [Arguments]  ${file_name}
    shoot  elastic-license-before
    Wait Until Page Contains Element  ${CVAH_UPDATE_ES_LICENSE_FORM__INPUT_HIDDEN}
    Execute JavaScript  document.getElementById('${CVAH_UPDATE_ES_LICENSE_FORM__INPUT_HIDDEN}').hidden = false;
    Choose File  ${CVAH_UPDATE_ES_LICENSE_FORM__INPUT_HIDDEN}  file_path=/usr/src/robot/${file_name}
    Wait Until Element Is Enabled  ${CVAH_UPDATE_ES_LICENSE_FORM__BUTTON_UPLOAD}
    click  ${CVAH_UPDATE_ES_LICENSE_FORM__BUTTON_UPLOAD}
    lookForElement  xpath=//snack-bar-container
    shoot  elastic-license-after
    lookFor  Successfully uploaded Elastic License. It will take a few minutes for Elastic to show. Check notifications for updates.
