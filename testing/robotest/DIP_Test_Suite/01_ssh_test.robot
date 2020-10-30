*** Settings ***
Documentation          This example demonstrates executing commands on a remote machine
...                    and getting their output and the return code.
...
...                    Notice how connections are handled as part of the suite setup and
...                    teardown. This saves some time when executing several test cases.

Library     SeleniumLibrary     5s
Library     SSHLibrary          15s


Suite Setup     Open SSH Connection
Suite Teardown         Close All Connections

*** Variables ***
${SSO_FILE}                 /opt/sso-idp/sso_admin_password.txt
${SSO_ADMIN_PASSWORD}       ${EMPTY}
${SINGLE_SIGN_ON_PAGE}      https://${HOST}/auth/realms/CVAH-SSO/account
                            # https://${HOST}/
                            # https://${HOST}/portal
                            # https://${HOST}/auth/realms/CVAH-SSO/account
                            # https://${HOST}/auth/admin/
# ${USERS_CONSOLE_PAGE}       https://${HOST}/auth/admin/CVAH-SSO/console/#/realms/CVAH-SSO/users


# Where you go to edit a specific user:  https://dip-controller.lan/auth/admin/CVAH-SSO/console/#/realms/CVAH-SSO/users/ce2169f5-3e0f-423c-8f6d-17b7bf0e3b21/user-credentials


# First Login Screen Locator Variables
${usernameLocator}      id=username
${passwordLocator}      id=password
${logInLocator}         id=kc-login

# DoD Banner Locater Variables
${DODAcceptLocator}       id=kc-accept

# Update Password Screen Locator Variables
${newPasswordLocator}      id=password-new
${confirmpasswordLocator}  id=password-confirm
${submitLocator}           css=input[class*='btn']

# Strings That Screens Should Contain
${LOGIN_SCREEN_TITLE}       Log In
${DOD_TERMS_CONDITIONS}     Terms and Conditions
${UPDATE_PASSWORD_TITLE}    Update password
${EDIT_ACCOUNT_TITLE}       Edit Account
${OTP_PAGE_STRING}          Authenticator
${UPDATE_ACCOUNT_TITLE}     Update Account Information

# Value Variables
${SSO_ADMIN_USERNAME}       admin
${SSO_ADMIN_PASSWORD}
${NEW_SSO_ADMIN_PASSWORD}   We.are.tfplenum4$


*** Test Cases ***
Get SSO Administrator Password
    [Tags]      THISISCVAH-7528
    [Documentation]     Grab The SSO Administrator Password From The Users Controller
    Set Log Level  DEBUG
    Log   message=This is Get SSO Admin Test console=yes
    Get SSO Password


Attempt To Login
    [Tags]      THISISCVAH-7528
    [Documentation]     Test Case that Attempts Login
    Log   message=This is Attempt To Login  console=yes   html=yes
    Open Firefox  ${BROWSER}
    SeleniumLibrary.Capture Page Screenshot  filename=attempt-login-screenshot-{index}.png
    Enter Login Username And Password        ${SSO_ADMIN_USERNAME}  ${SSO_ADMIN_PASSWORD}
    Run Keyword And Continue On Failure      Accept DoD Banner

Update Password
    [Tags]      THISISCVAH-7528
    [Documentation]     Test Case That Attempts To Update The Users Password
    Log                          message=This is Update Password  level=DEBUG  console=yes  html=yes
    Enter New Password           ${NEW_SSO_ADMIN_PASSWORD}
    SeleniumLibrary.Capture Page Screenshot  filename=update-password-screenshot-{index}.png


*** Keywords ***

Open SSH Connection
    [Tags]      THISISCVAH-7528
    [Documentation]  Perform The Suite Setup Functionality of Setting The Log Level, And SSH'ing Into The Host
    Open Connection     ${HOST}
    Login               ${HOST_USERNAME}  ${HOST_PASSWORD}

Get SSO Password
    [Tags]      THISISCVAH-7528
    [Documentation]     Does the task of retrieving the password from the text file
    ${local_sso_pword}=  Execute Command   cat ${SSO_FILE}
    Set Suite Variable  ${SSO_ADMIN_PASSWORD}  ${local_sso_pword}
    Log     The SSO Password is ${local_sso_pword}
    [Return]    ${local_sso_pword}

Open Firefox
    [Tags]      THISISCVAH-7528
    [Arguments]     ${BROWSER}
    Open Browser    ${SINGLE_SIGN_ON_PAGE}  browser=${BROWSER}

Accept DoD Banner
    [Tags]      THISISCVAH-7528
    [Documentation]  This function is made to accept the DoD Banner
    Log Location
    SeleniumLibrary.Capture Page Screenshot  filename=accept-banner-screenshot-{index}.png
    Wait Until Page Contains    ${DOD_TERMS_CONDITIONS}
    Click DoD Accept Button
    Wait Until Page Contains    ${UPDATE_PASSWORD_TITLE}

Enter Login Username And Password
    [Tags]      THISISCVAH-7528
    [Arguments]  ${usernameValue}  ${passwordValue}
    [Documentation]  Set the Login Pages username, password INPUT elements

    Log     message=KEYWORD Enter Login Username And Password  level=DEBUG  console=yes  html=yes
    Log Location
    Wait Until Page Contains Element    ${usernameLocator}
    Wait Until Page Contains Element    ${passwordLocator}
    SeleniumLibrary.Capture Page Screenshot  filename=keyword-enterloginup-screenshot-{index}.png
    Input Text  ${usernameLocator}  ${usernameValue}
    Input Text  ${passwordLocator}  ${passwordValue}
    Click Element  ${logInLocator}

Click DoD Accept Button
    [Tags]      THISISCVAH-7528
    [Documentation]     Click on the Accept INPUT Element
    Click Element   ${DODAcceptLocator}

Enter New Password
    [Tags]      THISISCVAH-7528
    [Arguments]  ${newPasswordValue}
    [Documentation]  Set Update Pages newpassword, confirmpassword INPUT elements
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
