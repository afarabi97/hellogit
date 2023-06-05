*** Settings ***
Resource    ../include/dipHealthVariables.resource


*** Keywords ***
Verify Nodes Are Ready
    [Documentation]  Checks the nodes table on Health page and verifies their status is "Ready"
    &{nodes_list} =  Get Nodes
    lookForElement  ${locNodeTableRows}
    ${num_rows} =  Get Element Count  ${locNodeTableRows}
    FOR  ${row}  IN RANGE  1  ${num_rows}  2
        ${current_row} =  Catenate  ${locNodeTableRows}  [${row}]
        ${node_name} =  Get Text  ${current_row}/td[1]
        ${ip_address} =  Get Text  ${current_row}/td[2]
        ${node_type} =  Get Text  ${current_row}/td[4]
        ${expected_ip} =  Set Variable  ${nodes_list}[${node_name}][0]
        ${expected_type} =  Convert To Lower Case  ${nodes_list}[${node_name}][1]
        Should Be Equal As Strings  ${expected_ip}  ${ip_address}
        Should Be Equal As Strings  ${expected_type}  ${node_type}
        Element Text Should Be  ${current_row}/td[3]/span  check_circle
    END

Check Health Page For App
    [Arguments]  ${application_name}
    [Documentation]  Visual confirmation on the Health Page that the app is installed
    log     Check Health Page For App ${application_name}
    Navigate To Health
    reload
    Wait Until Page Does Not Contain  Pod Errors  5m
    ${app_name_lower} =  Convert To Lower Case  ${application_name}
    ${expected_text} =  Set Variable If
    ...  '${app_name_lower}' == 'arkime'  -${app_name_lower}-  ${app_name_lower}  # else var just assigned app name
    ${app_on_health_page} =  Set Variable  False
    lookFor  Pods
    Wait Until Element Is Visible  ${locPodTableExpand}
    ${table_expand_elements} =  Get WebElements  ${locPodTableExpand}
    FOR  ${table_expand}  IN  @{table_expand_elements}
        click  ${table_expand}
        Sleep  1s
        ${pod_name} =  Inject  ${locPodNameTmpl}  ${expected_text}
        ${count} =  Get Element Count  ${pod_name}
        IF  ${count} > 0
            log  Found application: ${application_name}
            ${app_on_health_page} =  Set Variable  True
            Exit For Loop
        END
    END
    Run Keyword if  '${app_on_health_page}'=='False'  Fail  ${application_name} not listed on Health page