*** Settings ***
Resource    ../../lib/dipCommonKeywords.resource
Resource    ../../lib/dipMipMgmtKeywords.resource
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
Add Additional Nodes And MIP - Virtual
    [Tags]  THISISCVAH-13785
    [Documentation]  Adds one of each type of virtual node (server, sensor, service, MIP) to the kit
    Set Selenium Speed  0.5s
    Navigate To MIP Management
    Enter Virtual MIP Information  mip_hostname=robottest-mip

    Navigate To Node Management
    Enter Virtual Node Information  node_type=Server  hostname=robottest-server
    Enter Virtual Node Information  node_type=Sensor  hostname=robottest-sensor
    Enter Virtual Node Information  node_type=Service  hostname=robottest-service

    Navigate To Node Management
    Verify Node Was Added  robottest-server  robottest-sensor  robottest-service

    Navigate To MIP Management
    Verify Node Was Added  robottest-mip
