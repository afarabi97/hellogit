*** Settings ***
Documentation          Test suite for the virtual DIP controller. The following tests are ran through the
...                    GitLab pipeline and results posted on TFPLENUM Zepher account.
...
...                    Notice how connections are handled as part of the suite setup and
...                    teardown. This saves some time when executing several test cases.

Resource    ../../lib/dipCommonKeywords.resource
Resource    ../../lib/dipCatalogKeywords.resource

Library     SeleniumLibrary     15s
Library     SSHLibrary          15s
Library     String


Suite Setup       Open SSH Connection      ${HOST}                ${HOST_USERNAME}                ${HOST_PASSWORD}
Test Setup        Run Keywords             Runner Open Browser    ${HOST}                         ${BROWSER}
                  ...                      AND                    Set DIP Kit Global Variables
                  ...                      AND                    Login Into DIP Controller    ${SSO_ADMIN_USERNAME}  ${NEW_SSO_ADMIN_PASSWORD}
Test Teardown     Close Browser
Suite Teardown    Close All Connections


*** Test Cases ***
Verify Correct System Version Number
    [Tags]  THISISCVAH-8225
    [Documentation]  Test to check that controller has correct system name and version number.
    ...              Also checks that the Service Now web address is correct.
    Runner Open Browser  ${HOST}  ${BROWSER}
    Login Into DIP Controller  ${SSO_ADMIN_USERNAME}  ${NEW_SSO_ADMIN_PASSWORD}
    log     Verifying the version number listed on the Support page
    Wait Until Element Is Visible  ${locSupportPageNavIcon}
    Click Element  ${locSupportPageNavIcon}
    Sleep  2s  reason=Version number loads slightly after the element loads onto the page
    Element Should Contain  ${locSystemVersionNumber}  ${KIT_VERSION}
    Element Should Contain  ${locServiceNowURL}  https://afdco.servicenowservices.com/sp

Install And Uninstall Apps From Catalog Page
    [Tags]  THISISCVAH-10181
    [Documentation]  Check functionality of the Catalog page by installing and uninstalling PMO supported apps.
    Runner Open Browser  ${HOST}  ${BROWSER}
    Login Into DIP Controller  ${SSO_ADMIN_USERNAME}  ${NEW_SSO_ADMIN_PASSWORD}
    Install/Uninstall Every App
