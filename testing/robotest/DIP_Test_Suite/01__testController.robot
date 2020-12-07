*** Settings ***
Documentation          This example demonstrates executing commands on a remote machine
...                    and getting their output and the return code.
...
...                    Notice how connections are handled as part of the suite setup and
...                    teardown. This saves some time when executing several test cases.

Resource    ../lib/dipKeywords.resource

Library     SeleniumLibrary     5s
Library     SSHLibrary          15s


Suite Setup         dipKeywords.Open SSH Connection  ${HOST}  ${HOST_USERNAME}  ${HOST_PASSWORD}
Suite Teardown      Close Browser and SSH Connection

*** Variables ***
${SINGLE_SIGN_ON_PAGE}      https://${HOST}
${SSO_ADMIN_USERNAME}       admin
${SSO_ADMIN_PASSWORD}
${NEW_SSO_ADMIN_PASSWORD}   1qaz2wsx!QAZ@WSX


*** Test Cases ***
Perform Initial SSO for DIP Controller
    [Tags]      THISISCVAH-7528
    [Documentation]     Grab The SSO Administrator Password From The Users Controller
    ${SSO_ADMIN_PASSWORD} =  dipKeywords.Get SSO Administrator Password
    Open Browser    ${SINGLE_SIGN_ON_PAGE}  ${BROWSER}
    # Sleep  15s
    SeleniumLibrary.Capture Page Screenshot  filename=keyword-enterloginup-screenshot-{index}.png
    dipKeywords.Login Into DIP Controller  ${SSO_ADMIN_USERNAME}  ${SSO_ADMIN_PASSWORD}
    Run Keyword And Continue On Failure  Accept DoD Banner
    dipKeywords.Update Password  ${NEW_SSO_ADMIN_PASSWORD}
