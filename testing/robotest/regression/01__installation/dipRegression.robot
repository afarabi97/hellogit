*** Settings ***
Documentation          Test suite for the virtual DIP controller. The following tests are ran through the
...                    GitLab pipeline and results posted on TFPLENUM Zepher account.
...
...                    Notice how connections are handled as part of the suite setup and
...                    teardown. This saves some time when executing several test cases.

Resource    ../../lib/dipCommonKeywords.resource
Resource    ../../lib/dipAlertsKeywords.resource
Resource    ../../lib/dipCatalogKeywords.resource
Resource    ../../lib/dipNodeMgmtKeywords.resource
Resource    ../../lib/dipRulesetKeywords.resource
Variables   ../../include/element_ids_frontend.py

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
Install And Uninstall Apps From Catalog Page
    [Tags]  THISISCVAH-10181
    [Documentation]  Check functionality of the Catalog page by installing and uninstalling PMO supported apps.
    Set Selenium Speed            0.5s
    Install Dependent Apps        Arkime-viewer    Arkime
    Install Independent Apps      Logstash    Suricata    Zeek    Rocketchat  Wikijs
    Install Independent Apps      Mattermost    Nifi    Jcat-nifi    Redmine    Netflow-filebeat
    Install Dependent Apps        Cortex    Misp    Hive

Add Node - Virtual
    [Tags]  THISISCVAH-10220
    [Documentation]  Adds one of each type of virtual node (server, sensor, service) to the kit
    Set Selenium Speed  0.5s
    Navigate To Node Management
    Enter Virtual Node Information  node_type=server  hostname=robottest-server
    Enter Virtual Node Information  node_type=sensor  hostname=robottest-sensor
    Enter Virtual Node Information  node_type=service  hostname=robottest-service
    Verify Node Was Added  robottest-server  robottest-sensor  robottest-service

Remove Node - Virtual
    [Tags]  THISISCVAH-10221
    [Documentation]  Removes virtual nodes that were added in the previous test
    Set Selenium Speed  0.5s
    Navigate To Node Management
    Delete Node  text=robottest-sensor
    Delete Node  text=robottest-service
    Verify Node Was Deleted  robottest-sensor  robottest-service