*** Settings ***
Resource    ../../lib/dipCommonKeywords.resource

Library    SeleniumLibrary    15s
Library    SSHLibrary         15s
Library    String


Test Teardown    Close All Browsers

*** Test Cases ***
Perform Initial SSO for DIP Controller
    [Tags]  THISISCVAH-7528
    [Documentation]  Grabs the SSO administrator password from
    ...              the user's controller and performs initial SSO.
    ...              Logs into the DIP controller, accepts banner
    ...              page, and updates the password when prompted.
    Wait Until Keyword Succeeds  3x  5s  Runner Open Browser  ${HOST}  ${BROWSER}
    Open SSH Connection  ${HOST}  ${HOST_USERNAME}  ${HOST_PASSWORD}
    ${sso_pword} =  Execute Command  cat ${SSO_FILE}  # Retrieves the SSO password from the text file
    Close Connection
    Log Into DIP Controller  ${SSO_ADMIN_USERNAME}  ${sso_pword}
    Log Out Of Controller
