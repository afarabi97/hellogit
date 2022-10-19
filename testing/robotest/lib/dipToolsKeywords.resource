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
        IF  '${node[1]}' != 'MinIO' and '${node[1]}' != 'MIP'
            Open Connection  ${node[0]}
            Login  root  ${ssh_pw}
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
