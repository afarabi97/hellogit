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
Install Suricata Test Applications
    Set Selenium Speed           0.5s
    Install App                  Suricata

Configure Suricata Ruleset
    [Tags]                       THISISCVAH-10222
    [Documentation]              The robot portion of the test will add
    ...                          a ruleset folder and enable the already
    ...                          present sample scripts. Since kibana
    ...                          information is validated using ansible
    ...                          this particular test is to ensure the
    ...                          UI is working as intended. Although
    ...                          this just syncs the rules, when
    ...                          combined with the output of
    ...                          THISISCVAH-10191 we gain a complete
    ...                          picture of the state of the UI & Backend
    Set Selenium Speed           0.5s
    Set Suricata Ruleset To Enabled With All Sensors Assigned


