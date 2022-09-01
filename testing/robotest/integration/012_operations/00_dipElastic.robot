*** Settings ***
Resource    ../../lib/dipCommonKeywords.resource
Resource    ../../lib/dipRulesetKeywords.resource
Resource    ../../lib/dipElasticKeywords.resource

Library    SeleniumLibrary    15s
Library    SSHLibrary         15s
Library    String
Library    Collections


Suite Setup       Open SSH Connection      ${HOST}                ${HOST_USERNAME}                ${HOST_PASSWORD}
Test Setup        Run Keywords             Runner Open Browser    ${HOST}                         ${BROWSER}
                  ...                      AND                    Set DIP Kit Global Variables
                  ...                      AND                    Log Into DIP Controller  ${SSO_ADMIN_USERNAME}    ${NEW_SSO_ADMIN_PASSWORD}
Test Teardown     Close Browser
Suite Teardown    Close All Connections

*** Test Cases ***
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

Run Index Management Test
    [Tags]                           THISISCVAH-12853
    [Documentation]                  Run Index Management Tests
    Set Selenium Speed               0.5s
    Install Multiple Apps            Zeek    Suricata
    Close Indexes And Validate       Zeek    Suricata

Check MinIO (Elastic) Backup Capability
    [Tags]  THISISCVAH-12832
    [Documentation]  Tests the "Backup and close" option on the Index Management page
    Set Selenium Speed  0.5s
    Navigate To Index Management
    Backup And Close Indexes
