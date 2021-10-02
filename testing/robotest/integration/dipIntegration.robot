*** Settings ***
Documentation          Test suite for the virtual DIP controller. The following tests are ran through the
...                    GitLab pipeline and results posted on TFPLENUM Zepher account.
...
...                    Notice how connections are handled as part of the suite setup and
...                    teardown. This saves some time when executing several test cases.

Resource    ../lib/dipCommonKeywords.resource
Resource    ../lib/dipCatalogKeywords.resource
Resource    ../lib/dipRulesetKeywords.resource
Resource    ../include/dipCatalogVariables.resource
Resource    ../include/dipRulesetVariables.resource

Library     SeleniumLibrary     15s
Library     SSHLibrary          15s
Library     String


Suite Setup         Open SSH Connection  ${HOST}  ${HOST_USERNAME}  ${HOST_PASSWORD}
Test Setup          Run Keywords  Runner Open Browser  ${HOST}  ${BROWSER}
                    ...     AND  Set DIP Kit Global Variables
Test Teardown       Close Browser
Suite Teardown      Run Keywords  Clean Up Catalog Page
                    ...  AND  Close All Connections

*** Test Cases ***
Perform Initial SSO for DIP Controller
    [Tags]  THISISCVAH-7528
    [Documentation]    Grabs the SSO administrator password from the user's controller and performs initial SSO.
    ...                Logs into the DIP controller, accepts banner page, and updates the password when prompted.
    ${sso_pword} =  Execute Command  cat ${SSO_FILE}  # Retrieves the SSO password from the text file
    Login Into DIP Controller  ${SSO_ADMIN_USERNAME}  ${sso_pword}


Sync Zeek And Suricata Rulesets
    [Tags]  THISISCVAH-10222
    [Documentation]     The robot portion of the test will add a ruleset folder and enable the already
    ...                 present sample scripts. Since kibana information is validated using ansible
    ...                 this particular test is to ensure the UI is working as intended. Although
    ...                 this just syncs the rules, when combined with the output of THISISCVAH-10191
    ...                 we gain a complete picture of the state of the UI & Backend
    Set Selenium Speed  0.5s
    Login Into DIP Controller    ${SSO_ADMIN_USERNAME}  ${NEW_SSO_ADMIN_PASSWORD}
    Install Multiple Apps  Logstash  Zeek  Suricata
    Edit Zeek Ruleset
    Edit Suricata Ruleset
    Add Integration Ruleset
    Sync And Verify Rulesets


Run Elastic Integration Test
    [Tags]    THISISCVAH-10191
    [Documentation]    Grab the elastic password and run some tests
    Set Selenium Speed  0.5s
    Login Into DIP Controller    ${SSO_ADMIN_USERNAME}  ${NEW_SSO_ADMIN_PASSWORD}
    log     Running Elastic Integration Tests
    Install Multiple Apps  Logstash  Zeek  Suricata  Arkime-viewer  Arkime
    Login Into Kibana
    Navigate To PCAPs
    Play Wannacry PCAP
    Wait And Validate Kibana Hits
    Navigate To Portal

Perform Cleanup On Rulesets Page
    Set Selenium Speed  0.5s
    Login Into DIP Controller    ${SSO_ADMIN_USERNAME}  ${NEW_SSO_ADMIN_PASSWORD}
    log     Cleaning Up Zeek Integration And Zeek Sample Scripts
    Cleanup Zeek Signature Ruleset Files
    Cleanup Zeek Script Ruleset Files
    Cleanup Suricata Ruleset Files
    Sync And Verify Rulesets
