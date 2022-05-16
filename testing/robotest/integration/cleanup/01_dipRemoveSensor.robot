*** Settings ***
Resource    ../../lib/dipCommonKeywords.resource
Resource    ../../lib/dipNodeMgmtKeywords.resource

Library    SeleniumLibrary    15s
Library    SSHLibrary         15s
Library    String


Suite Setup       Open SSH Connection      ${HOST}                ${HOST_USERNAME}                ${HOST_PASSWORD}
Test Setup        Run Keywords             Runner Open Browser    ${HOST}                         ${BROWSER}
                  ...                      AND                    Set DIP Kit Global Variables
                  ...                      AND                    Login Into DIP Controller    ${SSO_ADMIN_USERNAME}    ${NEW_SSO_ADMIN_PASSWORD}
Test Teardown     Close Browser
Suite Teardown    Close All Connections

*** Test Cases ***
Remove Sensor - Virtual
    [Tags]                                         THISISCVAH-10221
    [Documentation]                                Logs in, goes to Node Management page and removes added virtual sensor(s)
    Set Selenium Speed                             0.5s
    Navigate To Node Management
    Delete Node  text=robottest-sensor
    Verify Node Was Deleted  robottest-sensor
