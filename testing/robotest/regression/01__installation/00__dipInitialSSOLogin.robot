*** Settings ***
Resource    ../../lib/dipCommonKeywords.resource

Library    SeleniumLibrary    15s
Library    SSHLibrary         15s
Library    String


Test Setup        Run Keywords             Runner Open Browser    ${HOST}                         ${BROWSER}
                  ...                      AND                    Set DIP Kit Global Variables
Test Teardown     Close Browser

*** Test Cases ***
Perform Initial SSO for DIP Controller
    [Tags]  THISISCVAH-7528
    [Documentation]  Grabs the SSO administrator password from
    ...              the user's controller and performs initial SSO.
    ...              Logs into the DIP controller, accepts banner
    ...              page, and updates the password when prompted.
    Open SSH Connection  ${HOST}  ${HOST_USERNAME}  ${HOST_PASSWORD}
    ${sso_pword} =  Execute Command  cat ${SSO_FILE}  # Retrieves the SSO password from the text file
    Close Connection
    Log Into DIP Controller  ${SSO_ADMIN_USERNAME}  ${sso_pword}
