*** Settings ***
Resource    ../../lib/dipAPIDocsKeywords.resource
Resource    ../../lib/dipCommonKeywords.resource
Resource    ../../lib/dipNodeMgmtKeywords.resource
Resource    ../../lib/dipPmoSupportKeywords.resource
Resource    ../../lib/dipPortalKeywords.resource
Resource    ../../lib/dipToolsKeywords.resource

Library    SeleniumLibrary    15s
Library    SSHLibrary         15s


Suite Setup       Open SSH Connection      ${HOST}                ${HOST_USERNAME}                ${HOST_PASSWORD}
Test Setup        Run Keywords             Runner Open Browser    ${HOST}                         ${BROWSER}
                  ...                      AND                    Set DIP Kit Global Variables
                  ...                      AND                    Log Into DIP Controller  ${SSO_ADMIN_USERNAME}    ${NEW_SSO_ADMIN_PASSWORD}
Test Teardown     Run Keywords             Log Out Of Controller  AND  Close All Browsers
Suite Teardown    Close All Connections

*** Test Cases ***
TFPlenum API Documentation Page
    [Tags]  THISISCVAH-11921
    [Documentation]  This test validates that the API docs page loads and does not return an error.
    Navigate To API Docs
    Wait Until Keyword Succeeds  2 min  3 sec  Validate API Documentation
    Switch Window  MAIN
