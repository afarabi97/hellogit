*** Settings ***
Documentation          Test suite for the virtual DIP controller. The following tests are ran through the
...                    GitLab pipeline and results posted on TFPLENUM Zepher account.
...
...                    Notice how connections are handled as part of the suite setup and
...                    teardown. This saves some time when executing several test cases.

Resource    ./lib_regression/dipCommonKeywords.resource
Resource    ./lib_regression/dipCatalogKeywords.resource
Resource    ./include_regression/dipCatalogVariables.resource

Library     SeleniumLibrary     15s    run_on_failure=NONE
Library     SSHLibrary          15s
Library     String


Test Setup          Set DIP Kit Global Variables
Test Teardown       Close All Browsers


*** Test Cases ***
Perform Initial SSO for DIP Controller
    [Tags]  THISISCVAH-7528
    [Documentation]  Grabs the SSO administrator password from the user's controller and performs initial SSO.
    ...              Logs into the DIP controller, accepts banner page, and updates the password when prompted.
    Open SSH Connection  ${HOST}  ${HOST_USERNAME}  ${HOST_PASSWORD}
    ${sso_pword} =  Execute Command  cat ${SSO_FILE}  # Retrieves the SSO password from the text file
    Close Connection
    Runner Open Browser  ${HOST}  ${BROWSER}
    Log In To DIP Controller  ${SSO_ADMIN_USERNAME}  ${sso_pword}
    Accept DoD Banner
    Update Password

Verify Correct System Name And Version Number
    [Tags]  THISISCVAH-8225
    [Documentation]  Test to check that controller has correct system name and version number.
    ...              Also checks that the Service Now web address is correct.
    Runner Open Browser  ${HOST}  ${BROWSER}
    Log In To DIP Controller  ${SSO_ADMIN_USERNAME}  ${NEW_SSO_ADMIN_PASSWORD}
    Click Element  ${locExpandSideNavIcon}
    Element Should Contain  ${locSystemName}  TFPLENUM Controller

    Wait Until Element Is Visible  ${locSupportPageNavIcon}
    Click Element  ${locSupportPageNavIcon}
    Sleep  2s  # Version number loads slightly after the element loads onto the page
    Element Should Contain  ${locSystemVersionNumber}  ${KIT_VERSION}
    Element Should Contain  ${locServiceNowURL}  https://afdco.servicenowservices.com/sp

Install And Uninstall Apps From Catalog Page
    [Tags]  THISISCVAH-10181
    [Documentation]  Check functionality of the Catalog page by installing and uninstalling PMO supported apps.
    Runner Open Browser  ${HOST}  ${BROWSER}
    Log In To DIP Controller  ${SSO_ADMIN_USERNAME}  ${NEW_SSO_ADMIN_PASSWORD}
    Install/Uninstall Every App
