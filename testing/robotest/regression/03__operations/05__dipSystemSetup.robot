*** Settings ***
Resource    ../../lib/dipCommonKeywords.resource
Resource    ../../lib/dipNodeMgmtKeywords.resource


Suite Setup       Open SSH Connection      ${HOST}                ${HOST_USERNAME}                ${HOST_PASSWORD}
Test Setup        Run Keywords             Runner Open Browser    ${HOST}                         ${BROWSER}
                  ...                      AND                    Set DIP Kit Global Variables
                  ...                      AND                    Log Into DIP Controller  ${SSO_ADMIN_USERNAME}    ${NEW_SSO_ADMIN_PASSWORD}
Test Teardown     Run Keywords             Log Out Of Controller  AND  Close All Browsers
Suite Teardown    Close All Connections

*** Test Cases ***
Check Node Info Dialog Boxes
    [Tags]  THISISCVAH-14154
    [Documentation]  Checks content of node info dialogs for each node on the Node Management page
    Navigate To Node Management
    &{nodes_list} =  Get Nodes
    Check Node Info Content  &{nodes_list}

Refresh Device Facts
    [Tags]  THISISCVAH-15446
    [Documentation]  Clicks the Refresh Device Facts button for each node on the kit
    Navigate To Node Management
    &{nodes_list} =  Get Nodes
    Refresh Device Facts For Each Node  &{nodes_list}
