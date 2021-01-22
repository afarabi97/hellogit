*** Settings ***
Resource    ../include/dipCommonVariables.resource

Library     SeleniumLibrary     30s
Library     SSHLibrary          15s


*** Keywords ***
Open SSH Connection
    [Arguments]  ${host}  ${host_username}  ${host_password}
    [Documentation]  Perform The Suite Setup Functionality of Setting The Log Level, And SSH'ing Into The Host
    Open Connection     ${host}
    Login               ${host_username}  ${host_password}

Login Into DIP Controller
    [Arguments]  ${username}  ${password}
    [Documentation]     Log into the DIP Controller after initial SSO occurs
    Wait Until Page Contains    Log In
    Input Text  ${locUsernameInput}  ${username}
    Input Text  ${locPasswordInput}  ${password}
    Click Element  ${locLogInButton}
    Wait Until Page Does Not Contain  Log In

Accept DoD Banner
    [Documentation]  This function is made to accept the DoD Banner
    Wait Until Page Contains    Terms and Conditions
    Click Element    ${locBannerAcceptButton}

Update Password
    [Documentation]  Set Update Pages newpassword, confirmpassword INPUT elements
    ...              Keyword That Attempts To Update The Users Password
    Wait Until Page Contains    Update password
    Input Text    ${locNewPasswordInput}  ${NEW_SSO_ADMIN_PASSWORD}
    Input text    ${locConfirmPasswordInput}  ${NEW_SSO_ADMIN_PASSWORD}
    Click Element    ${locSubmitButton}
    Wait Until Page Does Not Contain    Update password
    Click Element    ${locSubmitButton}
    Wait Until Page Does Not Contain    Update Account Information

Close Browser and SSH Connection
    Close All Browsers
    Close All Connections