*** Settings ***
Resource    ../../lib/dipCatalogKeywords.resource
Resource    ../../lib/dipCommonKeywords.resource
Resource    ../../lib/dipAlertsKeywords.resource
Resource    ../../lib/dipRulesetKeywords.resource

Library    SeleniumLibrary    15s
Library    SSHLibrary         15s
Library    String


Suite Setup       Open SSH Connection      ${HOST}                ${HOST_USERNAME}                ${HOST_PASSWORD}
Test Setup        Run Keywords             Runner Open Browser    ${HOST}                         ${BROWSER}
                  ...                      AND                    Set DIP Kit Global Variables
                  ...                      AND                    Log Into DIP Controller  ${SSO_ADMIN_USERNAME}    ${NEW_SSO_ADMIN_PASSWORD}
Test Teardown     Run Keywords             Log Out Of Controller  AND  Close All Browsers
Suite Teardown    Close All Connections

*** Test Cases ***
Validate Alerts Pages
    [Tags]  THISISCVAH-10993
    [Documentation]  Retest- Alerts Pages Validation after backend refactor
    Set Selenium Speed  0.5s
    Install Multiple Apps  Hive  Zeek  Suricata
    Obtain and Utilize Hive Keys
    Verify Play Stop and Refresh Button
    Verify Table Sorting
