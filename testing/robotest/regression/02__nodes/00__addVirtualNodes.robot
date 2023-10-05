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
Test Teardown     Run Keywords             Log Out Of Controller  AND  Close All Browsers
Suite Teardown    Close All Connections

*** Test Cases ***
Add Virtual MIP
    [Tags]  THISISCVAH-14418
    [Documentation]  Adds a virtual MIP to the DIP kit
    Set Selenium Speed            0.5s
    Navigate To MIP Management
    Enter Virtual MIP Information  mip_hostname=robottest-mip
    Wait Until Keyword Succeeds  3x  5s  Verify MIP Was Added  robottest-mip

Add Virtual Server Node
    [Tags]  THISISCVAH-14415
    [Documentation]  Adds a virtual server to the DIP kit
    Set Selenium Speed            0.5s
    Navigate To Node Management
    Enter Virtual Node Information  node_type=Server  hostname=robottest-server
    Verify Node Was Added  robottest-server

Add Virtual Sensor Node
    [Tags]  THISISCVAH-14416
    [Documentation]  Adds a virtual sensor to the DIP kit
    Set Selenium Speed            0.5s
    Navigate To Node Management
    Enter Virtual Node Information  node_type=Sensor  hostname=robottest-sensor
    Verify Node Was Added  robottest-sensor

Add Virtual Service Node
    [Tags]  THISISCVAH-14417
    [Documentation]  Adds a virtual service node to the DIP kit
    Set Selenium Speed            0.5s
    Navigate To Node Management
    Enter Virtual Node Information  node_type=Service  hostname=robottest-service
    Verify Node Was Added  robottest-service
    Navigate To MIP Management
    Wait Until Keyword Succeeds  3x  5s  Verify MIP Was Added  robottest-mip

Add Virtual MinIO Node
    [Tags]  THISISCVAH-14415
    [Documentation]  Adds a virtual MinIO to the DIP kit
    Set Selenium Speed            0.5s
    Skip If  '${PIPELINE}' != 'controller-only'  msg=MinIO was already added earlier in the pipeline
    Navigate To Node Management
    Enter Virtual Node Information  node_type=MinIO  hostname=robottest-minio
    Verify Node Was Added  robottest-minio
