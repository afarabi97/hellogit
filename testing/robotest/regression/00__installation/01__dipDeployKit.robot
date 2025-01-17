*** Settings ***
Documentation          Test suite for the virtual DIP controller. The following tests are ran through the
...                    GitLab pipeline and results posted on TFPLENUM Zepher account.
...
...                    Notice how connections are handled as part of the suite setup and
...                    teardown. This saves some time when executing several test cases.

Resource    ../../lib/dipCommonKeywords.resource
Resource    ../../lib/dipMipMgmtKeywords.resource
Resource    ../../lib/dipNodeMgmtKeywords.resource
Resource    ../../lib/dipSysSettingsKeywords.resource
Variables   ../../include/element_ids_frontend.py

Library     SeleniumLibrary     15s
Library     SSHLibrary          15s
Library     String


Suite Setup       Open SSH Connection      ${HOST}                ${HOST_USERNAME}                ${HOST_PASSWORD}
Test Setup        Run Keywords             Runner Open Browser    ${HOST}                         ${BROWSER}
                  ...                      AND                    Set DIP Kit Global Variables
                  ...                      AND                    Log Into DIP Controller    ${SSO_ADMIN_USERNAME}  ${NEW_SSO_ADMIN_PASSWORD}
Test Teardown     Run Keywords             Log Out Of Controller  AND  Close All Browsers
Suite Teardown    Close All Connections


*** Test Cases ***
Deploy Virtual DIP/MIP
    [Tags]  THISISCVAH-10064
    [Documentation]  Builds and deploys a complete DIP kit by first filling out all system settings, sets up
    ...              the control plane, and adds all nodes. Also tests adding & removing an additional node.
    Skip If  '${PIPELINE}' != 'controller-only'  msg=DIP kit is already built
    ${KIT_STATUS} =  Check Kit Status
    Set Global Variable  ${KIT_STATUS}
    Set Selenium Speed  0.5s
    Fill Out System Settings
    Setup Control Plane
    Server Setup
    Deploy Kit
    Node Setup
    MIP Setup

Check IP Ranges For Each Node Type
    [Tags]  THISISCVAH-14814
    [Documentation]  Checks the available range of IP address provided in the dropdown selection and
    ...              ensures the last octet is in the appropriate range for the specified node type.
    Set Selenium Speed  0.5s
    Navigate To Node Management
    Check Node IP Range  Server
    Check Node IP Range  Sensor
    Check Node IP Range  Service
    IF  '${PIPELINE}' != 'developer-all'
        Check Node IP Range  MinIO
    END
