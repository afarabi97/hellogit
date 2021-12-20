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
    Set Selenium Speed           0.5s
    Sync And Verify Rulesets

Play PCAPs Across Sensor
    [Documentation]                  Grab the elastic password and run some tests
    Set Selenium Speed               0.5s
    Navigate To PCAPs
    Play Wannacry PCAP
