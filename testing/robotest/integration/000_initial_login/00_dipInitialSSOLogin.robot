*** Settings ***
Resource    ../../lib/dipCommonKeywords.resource

Library    SeleniumLibrary    15s
Library    SSHLibrary         15s
Library    String


Suite Setup       Open SSH Connection      ${HOST}                ${HOST_USERNAME}                ${HOST_PASSWORD}
Test Setup        Run Keywords             Runner Open Browser    ${HOST}                         ${BROWSER}
                  ...                      AND                    Set DIP Kit Global Variables
Test Teardown     Close Browser
Suite Teardown    Close All Connections

*** Test Cases ***
Perform Initial SSO for DIP Controller
    [Tags]                       THISISCVAH-7528
    [Documentation]              Grabs the SSO administrator password from
    ...                          the user'scontroller and performs initial SSO.
    ...                          Logs into the DIP controller, accepts banner
    ...                          page, and updates the password when prompted.
    ${sso_pword} =               Execute Command                                   cat ${SSO_FILE}    # Retrieves the SSO password from the text file
    Login Into DIP Controller    ${SSO_ADMIN_USERNAME}                             ${sso_pword}
