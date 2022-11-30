*** Settings ***
Resource    ../../lib/dipCommonKeywords.resource
Resource    ../../lib/dipToolsKeywords.resource

Library    SeleniumLibrary    15s
Library    SSHLibrary         15s


Suite Setup       Open SSH Connection      ${HOST}                ${HOST_USERNAME}                ${HOST_PASSWORD}
Test Setup        Run Keywords             Runner Open Browser    ${HOST}                         ${BROWSER}
                  ...                      AND                    Set DIP Kit Global Variables
                  ...                      AND                    Log Into DIP Controller  ${SSO_ADMIN_USERNAME}    ${NEW_SSO_ADMIN_PASSWORD}
Test Teardown     Close Browser
Suite Teardown    Close All Connections

*** Test Cases ***
TFPlenum API Documentation Page
    [Tags]  THISISCVAH-11921
    [Documentation]  This test validates that the API docs page loads and does not return an error.
    Navigate To API Docs
    Validate API Documentation

Check Nodes On Health Page
    [Documentation]  Verify all kit nodes are listed and in the "Ready" state
    Navigate To Health
    Verify Nodes Are Ready

Change Kit Password
    [Tags]  THISISCVAH-12363
    [Documentation]  First gets the initial kit password and tests the SSH connection to every
    ...              node on the kit. Then it changes the kit password, checks SSH to each node,
    ...              and finally changes the kit password back to the initial one.
    ${initial_kit_pw} =  Get Initial Kit Password
    Close Connection
    Perform Steps For Changing Kit Password  ${NEW_KIT_PASSWORD}
    Check SSH Connection For All Nodes  ${NEW_KIT_PASSWORD}
    Perform Steps For Changing Kit Password  ${initial_kit_pw}
    Check SSH Connection For All Nodes  ${initial_kit_pw}
