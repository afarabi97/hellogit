*** Settings ***
Documentation          Test suite for the virtual DIP controller. The following tests are ran through the
...                    GitLab pipeline and results posted on TFPLENUM Zepher account.
...
...                    Notice how connections are handled as part of the suite setup and
...                    teardown. This saves some time when executing several test cases.

Resource    ../../lib/dipCommonKeywords.resource
Resource    ../../lib/dipCatalogKeywords.resource
Resource    ../../lib/dipNodeMgmtKeywords.resource

Library     SeleniumLibrary     15s
Library     SSHLibrary          15s
Library     String


Suite Setup       Open SSH Connection      ${HOST}                ${HOST_USERNAME}                ${HOST_PASSWORD}
Test Setup        Run Keywords             Runner Open Browser    ${HOST}                         ${BROWSER}
                  ...                      AND                    Set DIP Kit Global Variables
                  ...                      AND                    Login Into DIP Controller    ${SSO_ADMIN_USERNAME}  ${NEW_SSO_ADMIN_PASSWORD}
Test Teardown     Close Browser
Suite Teardown    Close All Connections


*** Test Cases ***
Verify Correct System Version Number
    [Tags]  THISISCVAH-8225
    [Documentation]  Test to check that controller has correct system name and version number.
    ...              Also checks that the Service Now web address is correct.
    Runner Open Browser  ${HOST}  ${BROWSER}
    Login Into DIP Controller  ${SSO_ADMIN_USERNAME}  ${NEW_SSO_ADMIN_PASSWORD}
    log     Verifying the version number listed on the Support page
    Wait Until Element Is Visible  ${locSupportPageNavIcon}
    Click Element  ${locSupportPageNavIcon}
    Sleep  2s  reason=Version number loads slightly after the element loads onto the page
    Element Should Contain  ${locSystemVersionNumber}  ${KIT_VERSION}
    Element Should Contain  ${locServiceNowURL}  https://afdco.servicenowservices.com/sp

Install And Uninstall Apps From Catalog Page
    [Tags]  THISISCVAH-10181
    [Documentation]  Check functionality of the Catalog page by installing and uninstalling PMO supported apps.
    Runner Open Browser  ${HOST}  ${BROWSER}
    Login Into DIP Controller  ${SSO_ADMIN_USERNAME}  ${NEW_SSO_ADMIN_PASSWORD}
    Set Selenium Speed            0.5s
    Install Dependent Apps        Arkime-viewer    Arkime
    Install Independent Apps      Logstash    Suricata    Zeek    Rocketchat  Wikijs
    Install Independent Apps      Mattermost    Nifi    Jcat-nifi    Redmine    Netflow-filebeat
    Install Dependent Apps        Cortex    Misp    Hive

Add Node - Virtual
    [Tags]  THISISCVAH-10220
    [Documentation]  Logs in, goes to Node Management page and adds a virtual sensor node
    Set Selenium Speed  0.5s
    Navigate To Node Management
    Enter Virtual Node Information  node_type=server  hostname=robottest-server
    Enter Virtual Node Information  node_type=sensor  hostname=robottest-sensor
    Enter Virtual Node Information  node_type=service  hostname=robottest-service
    Verify Node Was Added  robottest-server  robottest-sensor  robottest-service

Remove Sensor - Virtual
    [Tags]                                         THISISCVAH-10221
    [Documentation]                                Logs in, goes to Node Management page and removes added virtual sensor(s)
    Set Selenium Speed                             0.5s
    Navigate To Node Management
    Delete Node  text=robottest-sensor
    Delete Node  text=robottest-service
    Verify Node Was Deleted  robottest-sensor  robottest-service
