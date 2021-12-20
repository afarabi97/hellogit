*** Settings ***
Resource    ../../lib/dipCommonKeywords.resource

Library    SeleniumLibrary    15s
Library    SSHLibrary         15s
Library    String


Suite Setup       Open SSH Connection      ${HOST}                ${HOST_USERNAME}                ${HOST_PASSWORD}
Test Setup        Run Keywords             Runner Open Browser    ${HOST}                         ${BROWSER}
                  ...                      AND                    Set DIP Kit Global Variables
                  ...                      AND                    Login Into DIP Controller    ${SSO_ADMIN_USERNAME}  ${NEW_SSO_ADMIN_PASSWORD}
Test Teardown     Close Browser
Suite Teardown    Close All Connections

*** Test Cases ***
Install PMO Applications
    [Tags]                       THISISCVAH-10181
    [Documentation]              Check functionality of the Catalog
    ...                          page by installing  PMO supported apps.
    Set Selenium Speed           0.5s
    Install Multiple Apps        Logstash    Arkime-viewer   Arkime  Suricata   Zeek    Cortex  Hive    Misp    Rocketchat  Wikijs
