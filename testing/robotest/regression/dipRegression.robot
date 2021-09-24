*** Settings ***
Documentation          Test suite for the virtual DIP controller. The following tests are ran through the
...                    GitLab pipeline and results posted on TFPLENUM Zepher account.
...
...                    Notice how connections are handled as part of the suite setup and
...                    teardown. This saves some time when executing several test cases.

Resource    ../lib/dipCommonKeywords.resource
Resource    ../lib/dipCatalogKeywords.resource
Resource    ../include/dipCatalogVariables.resource

Library     SeleniumLibrary     15s    run_on_failure=NONE
Library     SSHLibrary          15s
Library     String


Suite Setup         Open SSH Connection  ${HOST}  ${HOST_USERNAME}  ${HOST_PASSWORD}
Test Setup          Run Keywords  Runner Open Browser  ${HOST}  ${BROWSER}
                    ...  AND  Set DIP Kit Global Variables
Test Teardown       Close Browser
Suite Teardown      Run Keywords  Clean Up Catalog Page
                    ...  AND  Close All Connections


*** Test Cases ***
Perform Initial SSO for DIP Controller
    [Tags]    THISISCVAH-7528
    [Documentation]    Grabs the SSO administrator password from the user's controller and performs initial SSO.
    ...                Logs into the DIP controller, accepts banner page, and updates the password when prompted.
    ${sso_pword} =  Execute Command  cat ${SSO_FILE}  # Retrieves the SSO password from the text file
    ${passed} =  Run Keyword And Return Status  Login Into DIP Controller  ${SSO_ADMIN_USERNAME}  ${sso_pword}
    Run Keyword If  ${passed}  Run Keywords  Accept DoD Banner
    ...  AND  Update Password

Verify Correct System Name And Version Number
    [Tags]    THISISCVAH-8225
    [Documentation]    Test to check that controller has correct system name and version number.
    ...                Also checks that the Service Now web address is correct.
    Login Into DIP Controller    ${SSO_ADMIN_USERNAME}  ${NEW_SSO_ADMIN_PASSWORD}
    Wait Until Page Contains    Portal
    Click Element    ${locSupportPageNavIcon}
    Wait Until Element Contains  ${locSystemVersionNumber}  ${KIT_VERSION}
    Element Should Contain    ${locServiceNowURL}  https://afdco.servicenowservices.com/sp

Install And Uninstall Apps From Catalog Page
    [Tags]  THISISCVAH-10181
    [Documentation]  Check functionality of the Catalog page by installing and uninstalling PMO supported apps.
    Runner Open Browser  ${HOST}  ${BROWSER}
    Login Into DIP Controller  ${SSO_ADMIN_USERNAME}  ${NEW_SSO_ADMIN_PASSWORD}
    Wait Until Page Contains  Portal
    Install/Uninstall Every App
