*** Settings ***
Documentation          Test suite for the virtual DIP controller. The following tests are ran through the
...                    GitLab pipeline and results posted on TFPLENUM Zepher account.
...
...                    Notice how connections are handled as part of the suite setup and
...                    teardown. This saves some time when executing several test cases.

Resource    ../lib/dipCommonKeywords.resource

Library     SeleniumLibrary     30s
Library     SSHLibrary          15s


Suite Setup         Open SSH Connection  ${HOST}  ${HOST_USERNAME}  ${HOST_PASSWORD}
Test Setup          Open Browser  https://${HOST}  ${BROWSER}
Test Teardown       Close Browser
Suite Teardown      Close All Connections


*** Test Cases ***
Perform Initial SSO for DIP Controller
    [Tags]    THISISCVAH-7528
    [Documentation]    Grabs the SSO administrator password from the user's controller and performs initial SSO.
    ...                Logs into the DIP controller, accepts banner page, and updates the password when prompted.
    ${sso_pword} =  Execute Command  cat ${SSO_FILE}  # Retrieves the SSO password from the text file
    Login Into DIP Controller  ${SSO_ADMIN_USERNAME}  ${sso_pword}
    Accept DoD Banner
    Update Password

Verify Correct System Name And Version Number
    [Tags]    THISISCVAH-8225
    [Documentation]    Test to check that controller has correct system name and version number.
    ...                Also checks that the Service Now web address is correct.
    Login Into DIP Controller    ${SSO_ADMIN_USERNAME}  ${NEW_SSO_ADMIN_PASSWORD}
    Wait Until Page Contains    Portal
    Click Element    ${locExpandSideNavIcon}
    Element Should Contain  ${locSystemName}  TFPLENUM ${SYSTEM_NAME} Controller  # System Name should be DIP, MIP, or GIP
    Click Element    ${locSupportPageNavIcon}
    Element Should Contain  ${locSystemVersionNumber}  ${KIT_VERSION}
    Element Should Contain    ${locServiceNowURL}  https://cvah.servicenowservices.com/sp