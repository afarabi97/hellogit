*** Settings ***
Resource    ../include/dipCommonVariables.resource

Library     SeleniumLibrary     30s    run_on_failure=NONE
Library     SSHLibrary          15s


*** Keywords ***
Set DIP Kit Global Variables
    [Documentation]  Checks if kit is bare-metal or virtual and sets global variables
    ${first_3_chars} =  Get Substring  ${PIPELINE}  0  3
    ${IS_BARE_METAL_KIT} =  Set Variable If  '${first_3_chars}' == 'hw-'  ${True}  ${False}
    Set Global Variable  ${IS_BARE_METAL_KIT}

Open SSH Connection
    [Arguments]  ${host}  ${host_username}  ${host_password}
    [Documentation]  Perform The Suite Setup Functionality of Setting The Log Level, And SSH'ing Into The Host
    Open Connection     ${host}
    Login               ${host_username}  ${host_password}

Runner Open Browser
    [Arguments]                ${host}  ${browser}
    [Documentation]  This keyword, along with the Open Chrome keyword, is necessary for Chrome to work within a Docker container.
    Log                        Opening browser to https://${host} in ${browser}
    Run Keyword If             'chrome' in '${browser}'      Open Chrome    ${host}    ${browser}
    ...                        ELSE                          Open Firefox    ${host}    ${browser}

Open Chrome
    [Arguments]                ${host}  ${browser}
    [Documentation]  Sets chrome options that allow Chrome to run headless within a docker container. Without these options set,
    ...              Google Chrome will crash and all tests running within Chrome will fail.
    ${chrome_options}          Evaluate                      sys.modules['selenium.webdriver'].ChromeOptions()    sys, selenium.webdriver
    Call Method                ${chrome_options}             add_argument                                         no-sandbox
    Run Keyword If             'Headless' in '${browser}'
    ...                        Call Method                   ${chrome_options}                                    add_argument                       headless
    ${browser}=                Run Keyword If                'Headless' in '${browser}'
    ...                        Set Variable                  chrome
    Call Method                ${chrome_options}             add_argument                                         gpu-disable
    Call Method                ${chrome_options}             add_argument                                         disable-dev-shm-usage
    Call Method                ${chrome_options}             add_argument                                         disable-web-security
    Call Method                ${chrome_options}             add_argument                                         allow-running-insecure-content
    Call Method                ${chrome_options}             add_argument                                         ignore-certificate-errors
    Create WebDriver  Chrome    chrome_options=${chrome_options}
    Go To    https://${host}

Open Firefox
    [Arguments]                ${host}  ${browser}
    Open Browser               https://${host}            browser=${browser}

Login Into DIP Controller
    [Arguments]  ${username}  ${password}
    [Documentation]     Log into the DIP Controller after initial SSO occurs
    Maximize Browser Window
    Wait Until Page Contains Element  ${locUsernameInput}
    Input Text  ${locUsernameInput}  ${username}
    Input Text  ${locPasswordInput}  ${password}
    Click Element  ${locLogInButton}
    Wait Until Page Does Not Contain Element  ${locLogInButton}

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