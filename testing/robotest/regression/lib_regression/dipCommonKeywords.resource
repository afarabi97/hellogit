*** Settings ***
Resource    ../include_regression/dipCommonVariables.resource
Library     SeleniumLibrary    30s    run_on_failure=NONE

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
    # Call Method                ${chrome_options}             add_argument                                         user-data-dir=/tmp/chrome_dev_session
    # ${options}                 Call Method                   ${chrome_options}                                    to_capabilities
    # Open Browser               https://${host}               browser=${browser}                                   desired_capabilities=${options}
    Create Webdriver  Chrome    chrome_options=${chrome_options}
    Go To    https://${host}

Open Firefox
    [Arguments]                ${host}  ${browser}
    Open Browser               https://${host}            browser=${browser}

Log In To DIP Controller
    [Arguments]  ${username}  ${password}
    [Documentation]  Log into the DIP Controller after initial SSO occurs
    Maximize Browser Window
    Wait Until Page Contains Element  ${locUsernameInput}
    Input Text  ${locUsernameInput}  ${username}
    Input Text  ${locPasswordInput}  ${password}
    Click Element  ${locLogInButton}
    Wait Until Page Does Not Contain Element  ${locLogInButton}
    Run Keyword If  '${password}' == '${NEW_SSO_ADMIN_PASSWORD}'
    ...  Wait Until Page Contains  Portal

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

Check If Still Logged Into Controller
    [Documentation]  If logged out of controller, this keyword will log back in.
    Reload Page
    Sleep  5s
    ${still_logged_in} =  Run Keyword And Return Status  Page Should Contain Element  ${locExpandSideNavIcon}
    Run Keyword If  not ${still_logged_in}
    ...  Run Keywords  Runner Open Browser  ${HOST}  ${BROWSER}
    ...  AND  Login Into DIP Controller  ${SSO_ADMIN_USERNAME}  ${NEW_SSO_ADMIN_PASSWORD}
    ...  AND  Wait Until Page Contains  Portal

Check Notifications Panel
    [Arguments]  ${notification_msg}  ${timeout}
    [Documentation]  Check Notifications panel for specified message.
    Click Element  ${locNotificationsNavIcon}
    Wait Until Element Is Visible  ${locAllNotificationTypeBtn}
    Click Element  ${locAllNotificationTypeBtn}
    Wait Until Element Contains  ${locNotificationsPopup}  ${notification_msg}  ${timeout}
    FOR  ${i}  IN RANGE  9999999
        ${notifications_visible} =  Run Keyword And Return Status  Element Should Be Visible  ${locNotificationsPopup}
        Exit For Loop If  ${notifications_visible} == ${False}
        SeleniumLibrary.Press Keys  None  ESCAPE
        Sleep  2s
    END

Clear Preexisting Notifications
    [Arguments]  ${notification_category}
    [Documentation]  Removes all notfications within the targeted notifications panel specified
    ...              through the argument parameter.
    Wait Until Page Contains Element  ${locNotificationsNavIconAlt}
    Wait Until Element Is Enabled  ${locNotificationsNavIconAlt}
    Click Element  ${locNotificationsNavIconAlt}
    Wait Until Page Contains Element  ${notification_category}
    Wait Until Element Is Enabled  ${notification_category}
    Wait Until Element Is Visible  ${notification_category}
    FOR  ${i}  IN RANGE  9999999
        ${click_intercepted} =  Run Keyword And Return Status  Click Button  ${notification_category}
        Exit For Loop If  ${click_intercepted}
    END
    ${contains_notifications} =  Run Keyword And Return Status  Wait Until Page Contains Element  ${locDeleteNotificationBtnIcon}  3s
    Run Keyword If  ${contains_notifications}  Delete Notifications
    Page Should Not Contain Element  ${locNotificationMessageContainer}//div[contains(@class, "outerCard__margin")]/div[@fxlayout="row"][1]//button[contains(@id, "button-delete")]
    FOR  ${i}  IN RANGE  9999999
        ${notifications_visible} =  Run Keyword And Return Status  Element Should Be Visible  ${locNotificationsPopup}
        Exit For Loop If  ${notifications_visible} == ${False}
        SeleniumLibrary.Press Keys  None  ESCAPE
        Sleep  2s
    END

Delete Notifications
    [Documentation]  Supportive keyword that iterates through all notification-messages and deletes
    ...              each one by clicking on the trash icons.
    Execute Javascript  document.querySelector("${locMessageContainerScrollBarJSS}").scrollLeft=500;
    FOR  ${i}  IN RANGE  9999999
        ${first_delete_btn} =  Set Variable  ${locNotificationMessageContainer}//div[contains(@class, "outerCard__margin")]/div[@fxlayout="row"]//button[contains(@id, "-0-button-delete")]
        ${no_messages} =  Run Keyword And Return Status  Page Should Not Contain Element  ${first_delete_btn}
        Exit For Loop If  ${no_messages}
        Click Button  ${first_delete_btn}
        Sleep  2s
    END

Add Link To Portal Page
    [Documentation]  Adds a user-link to the portal page by filling out the corresponding form
    ...              that appears after clicking the "+ Add Link" button. A link is then
    ...              displayed within the "User Links" section after it's been fully generated/rendered.
    ...              This link is tested via mouse click to validate that the user has been routed
    ...              towards the correct url.
    Wait Until Element Is Visible  ${locPortalPageAddLinkBtn}
    Wait Until Element Is Enabled  ${locPortalPageAddLinkBtn}
    Click Element  ${locPortalPageAddLinkBtn}
    Wait Until Element Is Visible  ${locAddLinkNameInput}
    Input Text  ${locAddLinkNameInput}  ${add_link_name_input_data}
    Wait Until Element Is Visible  ${locAddLinkUrlInput}
    Input Text  ${locAddLinkUrlInput}  ${add_link_url_input_data}
    Wait Until Element Is Visible  ${locAddLinkDescriptionInput}
    Input Text  ${locAddLinkDescriptionInput}  ${add_link_desc_input_data}
    Wait Until Element Is Enabled  ${locAddLinkSubmitBtn}
    Click Element  ${locAddLinkSubmitBtn}
    Wait Until Page Contains Element  ${locUserPortalLinkName}
    Element Should Contain  ${locUserPortalLinkName}  ${add_link_name_input_data}
    Element Should Contain  ${locUserPortalLinkUrl}  ${add_link_url_input_data}
    Element Should Contain  ${locUserPortalLinkDescription}  ${add_link_desc_input_data}
    Click Element  ${locUserPortalLinkUrl}
    Switch Window  NEW
    Location Should Be  ${add_link_url_input_data}
    Title Should Be  ${add_link_name_input_data}
    Switch Window  MAIN

Clear All User Links
    [Documentation]  Removes all preexisting user links from the portal page for test accuracy.
    Wait Until Page Contains Element  ${locPortalPageUserLinksSection}
    FOR    ${i}    IN RANGE    9999999
        ${user_link_exist} =  Run Keyword And Return Status  Page Should Contain Element  ${locDeleteUserLinkBtn}
        Exit For Loop If  ${user_link_exist} == ${False}
        Click Element  ${locDeleteUserLinkBtn}
        Wait Until Element Is Visible  ${locDeleteUserLinkConfirmBtn}
        Click Element  ${locDeleteUserLinkConfirmBtn}
        Sleep  1s
    END