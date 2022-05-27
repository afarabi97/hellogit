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
    log     Verifying the version number listed on the Support page
    Wait Until Element Is Visible  ${locSupportPageNavIcon}
    Click Element  ${locSupportPageNavIcon}
    Sleep  2s  reason=Version number loads slightly after the element loads onto the page
    Element Should Contain  ${locSystemVersionNumber}  ${KIT_VERSION}
    Element Should Contain  ${locServiceNowURL}  https://afdco.servicenowservices.com/sp

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

Sync Zeek And Suricata Rulesets
    [Tags]  THISISCVAH-10222
    [Documentation]  The robot portion of the test will add a ruleset folder and enable the already
    ...              present sample scripts. Since kibana information is validated using ansible
    ...              this particular test is to ensure the UI is working as intended. Although
    ...              this just syncs the rules, when combined with the output of THISISCVAH-10191
    ...              we gain a complete picture of the state of the UI & Backend
    Set Selenium Speed      0.5s
    Install Multiple Apps   Suricata  Zeek
    Edit Rule Set           Emerging Threats
    Edit Rule Set           Zeek Sample Scripts
    Add Rule Set            Zeek Integration Test Sample    Zeek Signatures
    Sync Rules
    Delete Rule Set         Zeek Integration Test Sample

Zeek Intel Script Upload
    [Tags]  THISISCVAH-12249
    [Documentation]  Validate the Zeek intel rules can be uploaded to the ruleset without errors.
    Set Selenium Speed  0.5s
    Add Rule Set        Zeek Intel Script Upload Test    Zeek Intel
    Upload Rules File   Zeek Intel Script Upload Test    mal_md5_robot.txt
    Delete Rule Set     Zeek Intel Script Upload Test

Play PCAPs Across Sensor
    [Documentation]  Grab the elastic password and run some tests
    Set Selenium Speed  0.5s
    Navigate To PCAPs
    Play Wannacry PCAP

Validate Alerts Pages
    [Tags]    THISISCVAH-10993
    [Documentation]     Retest- Alerts Pages Validation after backend refactor
    Set Selenium Speed  0.5s
    Install Multiple Apps   Hive   Zeek    Suricata
    Obtain and Utilize Hive Keys
    Verify Play Stop and Refresh Button
    Verify Table Sorting

Run Elastic Integration Test
    [Tags]                           THISISCVAH-10191
    [Documentation]                  Grab the elastic password and run some tests
    Set Selenium Speed               1s
    Install Multiple Apps            Logstash   Zeek    Suricata    Arkime-viewer    Arkime
    Log In To Kibana
    Navigate To PCAPs
    Play Wannacry PCAP
    Wait And Validate Kibana Hits
    Navigate To Portal