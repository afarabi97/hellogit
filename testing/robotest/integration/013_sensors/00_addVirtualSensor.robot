*** Settings ***
Resource    ../../lib/dipCommonKeywords.resource
Resource    ../../lib/dipNodeMgmtKeywords.resource

Library    SeleniumLibrary    15s
Library    SSHLibrary         15s
Library    String


Suite Setup       Open SSH Connection      ${HOST}                ${HOST_USERNAME}                ${HOST_PASSWORD}
Test Setup        Run Keywords             Runner Open Browser    ${HOST}                         ${BROWSER}
                  ...                      AND                    Set DIP Kit Global Variables
                  ...                      AND                    Login Into DIP Controller  ${SSO_ADMIN_USERNAME}    ${NEW_SSO_ADMIN_PASSWORD}
Test Teardown     Close Browser
Suite Teardown    Close All Connections

*** Test Cases ***
Add Sensor - Virtual
    [Tags]                                     THISISCVAH-10220
    [Documentation]                            Logs in, goes to Node Management page and adds a virtual sensor node
    Set Selenium Speed                         0.5s
    Navigate To Node Management
    Enter Virtual Sensor Information
    Wait For 30m To Verify Sensor Was Added
