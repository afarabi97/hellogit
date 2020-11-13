*** Settings ***
Resource    ../include/dipVariables.resource

Library     SeleniumLibrary     5s
Library     SSHLibrary          15s


*** Keywords ***
Open SSH Connection
    [Arguments]  ${host}  ${host_username}  ${host_password}
    [Documentation]  Perform The Suite Setup Functionality of Setting The Log Level, And SSH'ing Into The Host
    Open Connection     ${host}
    Login               ${host_username}  ${host_password}

Get SSO Administrator Password
    [Documentation]     Does the task of retrieving the password from the text file
    ${sso_pword} =  Execute Command   cat ${SSO_FILE}
    [Return]  ${sso_pword}

Login Into DIP Controller
    [Arguments]  ${usernameValue}  ${passwordValue}
    [Documentation]     Log into the DIP Controller after initial SSO occurs
    Wait Until Page Contains Element    ${usernameLocator}
    Wait Until Page Contains Element    ${passwordLocator}
    SeleniumLibrary.Capture Page Screenshot  filename=keyword-enterloginup-screenshot-{index}.png
    Input Text  ${usernameLocator}  ${usernameValue}
    Input Text  ${passwordLocator}  ${passwordValue}
    Click Element  ${logInLocator}
    SeleniumLibrary.Capture Page Screenshot  filename=keyword-enterloginup-screenshot-{index}.png
    # Sleep  3s
    Wait Until Page Does Not Contain  ${LOGIN_SCREEN_TITLE}  3s

Accept DoD Banner
    [Documentation]  This function is made to accept the DoD Banner
    Log Location
    SeleniumLibrary.Capture Page Screenshot  filename=accept-banner-screenshot-{index}.png
    Wait Until Page Contains    ${DOD_TERMS_CONDITIONS}
    Click Element               ${DODAcceptButton}  # Click on the Accept INPUT Element
    Wait Until Page Contains    ${UPDATE_PASSWORD_TITLE}

Update Password
    [Arguments]  ${newPasswordValue}
    [Documentation]  Set Update Pages newpassword, confirmpassword INPUT elements
    ...              Keyword That Attempts To Update The Users Password
    Wait Until Page Contains Element        ${newPasswordLocator}
    Wait Until Page Contains Element        ${confirmpasswordLocator}
    Wait Until Page Contains Element        ${submitLocator}
    SeleniumLibrary.Capture Page Screenshot  filename=keyword-enternewpassword-screenshot-{index}.png
    Input Text  ${newPasswordLocator}       ${newPasswordValue}
    Input text  ${confirmpasswordLocator}   ${newPasswordValue}
    Click Element  ${submitLocator}
    Wait Until Page Contains    ${UPDATE_ACCOUNT_TITLE}
    Click Element  ${submitLocator}
    Wait Until Page Contains     ${EDIT_ACCOUNT_TITLE}
    SeleniumLibrary.Capture Page Screenshot  filename=update-password-screenshot-{index}.png

Close Browser and SSH Connection
    Close All Browsers
    Close All Connections