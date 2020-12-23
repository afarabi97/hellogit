*** Settings ***
Documentation          Test suite for the virtual DIP controller. The following tests are ran through the
...                    GitLab pipeline and results posted on TFPLENUM Zepher account.
...
...                    Notice how connections are handled as part of the suite setup and
...                    teardown. This saves some time when executing several test cases.

Resource    ../lib/dipKeywords.resource

Library     SeleniumLibrary     5s
Library     SSHLibrary          15s


Suite Setup         dipKeywords.Open SSH Connection  ${HOST}  ${HOST_USERNAME}  ${HOST_PASSWORD}
Test Setup          Open Browser  https://${HOST}  ${BROWSER}
Test Teardown       Close Browser
Suite Teardown      Close All Connections


*** Test Cases ***
Perform Initial SSO for DIP Controller
    [Tags]    THISISCVAH-7528
    [Documentation]    Grabs the SSO administrator password from the user's controller and performs initial SSO.
    ...                Logs into the DIP controller, accepts banner page, and updates the password when prompted.
    ${sso_pword} =    Execute Command  cat ${SSO_FILE}  # Retrieves the SSO password from the text file
    dipKeywords.Login Into DIP Controller    ${SSO_ADMIN_USERNAME}  ${sso_pword}
    Run Keyword And Continue On Failure    Accept DoD Banner
    dipKeywords.Update Password    ${NEW_SSO_ADMIN_PASSWORD}
    SeleniumLibrary.Capture Page Screenshot    filename=Controller-screenshot-{index}.png

Verify Correct System Name And Version Number
    [Tags]    THISISCVAH-8225
    [Documentation]    Test to check that controller has correct system name and version number.
    ...                Also checks that the service now link is correct and working properly.
    dipKeywords.Login Into DIP Controller    ${SSO_ADMIN_USERNAME}  ${NEW_SSO_ADMIN_PASSWORD}
    Wait Until Page Contains    ${PORTAL_PAGE_TITLE}
    Click Element    ${EXPAND_SIDE_NAV_ICON}
    Run Keyword And Continue On Failure    Element Should Contain  ${FULL_SYSTEM_NAME}  TFPLENUM ${SYSTEM_NAME} Controller
    Click Element    ${SUPPORT_PAGE_NAV_ICON}
    Run Keyword And Continue On Failure    Element Should Contain  ${SYSTEM_VERSION_NUMBER}  ${KIT_VERSION}
    Element Should Contain    ${SERVICE_NOW_URL}  https://cvah.servicenowservices.com/sp
    Click Link    ${SERVICE_NOW_URL}
    Switch Window    NEW
    Wait Until Page Contains    Welcome to the Service Portal