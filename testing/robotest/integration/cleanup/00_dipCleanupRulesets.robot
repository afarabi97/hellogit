*** Settings ***
Resource    ../../lib/dipCommonKeywords.resource
Resource    ../../lib/dipRulesetKeywords.resource

Library    SeleniumLibrary    15s
Library    SSHLibrary         15s
Library    String


Suite Setup       Open SSH Connection      ${HOST}                ${HOST_USERNAME}                ${HOST_PASSWORD}
Test Setup        Run Keywords             Runner Open Browser    ${HOST}                         ${BROWSER}
                  ...                      AND                    Set DIP Kit Global Variables
                  ...                      AND                    Set Ruleset Initial State
                  ...                      AND                    Login Into DIP Controller    ${SSO_ADMIN_USERNAME}    ${NEW_SSO_ADMIN_PASSWORD}
Test Teardown     Close Browser
Suite Teardown    Close All Connections

*** Test Cases ***
Perform Cleanup On Rulesets Page
    Set Selenium Speed                      0.5s
    Set Zeek Signatures Ruleset To Deleted Then Reset State
    Set Zeek Scripts Ruleset To Disabled With No Sensors Assigned Then Reset State
    Set Suricata Ruleset To Enabled With All Sensors Assigned Then Reset State
    Sync And Verify Rulesets
