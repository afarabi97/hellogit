*** Settings ***
Resource    ../../lib/dipCommonKeywords.resource
Resource    ../../lib/dipRulesetKeywords.resource

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
