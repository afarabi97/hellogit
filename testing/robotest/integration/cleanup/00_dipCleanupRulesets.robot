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
Perform Cleanup On Rulesets Page
    Set Selenium Speed                      0.5s
    Delete Rule Set  Zeek Integration Test Sample
    Edit Rule Set  Zeek Sample Scripts  reset=${True}
    Edit Rule Set  Emerging Threats
    Sync Rules
