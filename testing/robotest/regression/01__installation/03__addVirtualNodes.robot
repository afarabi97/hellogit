*** Settings ***
Resource    ../../lib/dipCommonKeywords.resource
Resource    ../../lib/dipNodeMgmtKeywords.resource

Library    SeleniumLibrary    15s
Library    SSHLibrary         15s
Library    String


Suite Setup       Open SSH Connection      ${HOST}                ${HOST_USERNAME}                ${HOST_PASSWORD}
Test Setup        Run Keywords             Runner Open Browser    ${HOST}                         ${BROWSER}
                  ...                      AND                    Set DIP Kit Global Variables
                  ...                      AND                    Log Into DIP Controller  ${SSO_ADMIN_USERNAME}    ${NEW_SSO_ADMIN_PASSWORD}
Test Teardown     Close Browser
Suite Teardown    Close All Connections

*** Test Cases ***
Add Node - Virtual
    [Tags]  THISISCVAH-10220
    [Documentation]  Adds one of each type of virtual node (server, sensor, service) to the kit
    Set Selenium Speed  0.5s
    Navigate To Node Management
    Enter Virtual Node Information  node_type=Server  hostname=robottest-server
    Enter Virtual Node Information  node_type=Sensor  hostname=robottest-sensor
    Enter Virtual Node Information  node_type=Service  hostname=robottest-service
    Verify Node Was Added  robottest-server  robottest-sensor  robottest-service
