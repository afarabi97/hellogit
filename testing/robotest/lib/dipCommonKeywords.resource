*** Settings ***
Resource    ../include/dipCommonVariables.resource

Library     SeleniumLibrary     15s    run_on_failure= Loggy.failure
Library     SSHLibrary          15s
Library     String
Library     Loggy.py

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

handle selenium failure
    SeleniumLibrary.Capture Page Screenshot    filename=failed-screenshot-{index}.png
    SeleniumLibrary.Log Location
    SeleniumLibrary.Log Source      loglevel=DEBUG
    Log variables   level=DEBUG

Open Firefox
    [Arguments]                ${host}  ${browser}
    Open Browser               https://${host}            browser=${browser}

Login Into DIP Controller
    [Arguments]  ${username}  ${password}
    [Documentation]     Log into the DIP Controller before or after initial SSO
    Maximize Browser Window
    IF  '${password}' == '${NEW_SSO_ADMIN_PASSWORD}'
    # If this is the new admin password then try it
        click  ${locUsernameInput}
        type  ${locUsernameInput}  ${username}
        type  ${locPasswordInput}  ${password}
        click  ${locLogInButton}
        ${simlo}=   Get Location
        Wait Until Page Does Not Contain Element  ${locLogInButton}
        lookFor     Portal
    ELSE
        # If this is NOT the new admin password then try to update it but it is okay if you can not
        click  ${locUsernameInput}
        type  ${locUsernameInput}  ${username}
        type  ${locPasswordInput}  ${password}
        click  ${locLogInButton}
        Sleep   5s
        ${simlo}=   Get Location
        ${match}    ${value}     Run Keyword And Ignore Error  Should Contain     ${simlo}    terms_and_conditions
        IF      '${match}' == 'PASS'
            Accept DoD Banner
            Update Password
        END
    END

Accept DoD Banner
    [Documentation]  This function is made to accept the DoD Banner
    log     Accepting DoD Banner
    lookFor    Terms and Conditions
    click    ${locBannerAcceptButton}

Update Password
    [Documentation]  Set Update Pages newpassword, confirmpassword INPUT elements
    ...              Keyword That Attempts To Update The Users Password
    log     Updating SSO Admin Password
    lookFor    Update password
    type    ${locNewPasswordInput}  ${NEW_SSO_ADMIN_PASSWORD}
    type    ${locConfirmPasswordInput}  ${NEW_SSO_ADMIN_PASSWORD}
    click    ${locSubmitButton}
    Wait Until Page Does Not Contain    Update password
    click    ${locSubmitButton}
    Wait Until Page Does Not Contain    Update Account Information

Close Browser and SSH Connection
    Close All Browsers
    Close All Connections

Navigate To ${page}
    log         "Navigating To ${page} Page"
    IF          "${page}" == "Portal"
        Go To       ${Portal}
        lookFor         Portal
    ELSE IF     "${page}" == "Rulesets"
        Go To           ${Rulesets}
        lookFor         Rule
    ELSE IF     "${page}" == "Kibana"
        Get Kibana Credentials
        Go To           ${KIBANA_IP}
        lookFor         Welcome to Elastic
    ELSE IF     "${page}" == "Hive"
        Get Hive IP
        Go To           ${HIVE_IP}
        lookFor         Sign in to start your session
    ELSE IF     "${page}" == "PCAPs"
        Go To       ${PCAPs}
        lookFor         Test Files
    ELSE IF     "${page}" == "Node Management"
        Go To           ${NodeManagement}
        lookFor         Node Management
        whenVisible     ${locNodeMgmtTable}     timeout=60s     error=Node Management Page did not load within
    ELSE IF     "${page}" == "Alerts"
        Go To    ${Alerts}
        lookFor  Hive Settings
    END

Get Kibana Credentials
    log         Retrieving Kibana Username and Password
    Go To       ${Portal}
    lookFor     Portal

    ${index} =  Find Portal App index  kibana
    ${locKibanaUserPassword} =  Set Variable  id=cvah-portal-portal-link-${index}-logins
    ${locKibanaKitIP} =  Set Variable  id=cvah-portal-portal-link-${index}-ip
    lookForElement  ${locKibanaUserPassword}
    ${kibana_user_password_full_text} =  Get Text    ${locKibanaUserPassword}
    log     Kibana Full Text Password: ${kibana_user_password_full_text}
    ${KIBANA_IP} =  Get Text    ${locKibanaKitIP}
    log     Kibana IP: ${KIBANA_IP}
    ${KIBANA_PASSWORD} =    Get Substring    ${kibana_user_password_full_text}    23    end=None
    log     Kibana Password: ${KIBANA_PASSWORD}
    Set Global Variable     ${KIBANA_IP}
    Set Global Variable     ${KIBANA_PASSWORD}

Get Hive IP
    log         Retrieving Hive Username and Password
    Go To       ${Portal}
    lookFor     Portal

    ${index} =  Find Portal App index  hive
    ${locHiveKitIP} =  Set Variable  id=cvah-portal-portal-link-${index}-ip
    ${HIVE_IP} =  Get Text    ${locHiveKitIP}
    log     Hive IP: ${HIVE_IP}
    Set Global Variable     ${HIVE_IP}

Login Into Kibana
    Navigate To Kibana
    click       ${locElasticLoginButton}
    lookFor     Username
    type        //input[@name="username"]    ${KIBANA_USERNAME}
    type        //input[@name="password"]    ${KIBANA_PASSWORD}
    click       //span[@class="euiButton__text"]
    lookFor     Hunt
    click       //a[normalize-space()='Hunt']
    lookFor     Home
    ${Hunt}=    Get Location
    Set Global Variable     ${Hunt}
    click       xpath=(//button[@class="euiButtonEmpty euiButtonEmpty--text euiHeaderSectionItemButton"])[3]
    click       //span[@title="Stack Management"]
    lookFor     Welcome to Stack Management
    shoot       StackManagement

Play ${pcap} PCAP
    IF      "${pcap}" == "Wannacry"
        click    ${locPcapPlayBtn}
        click    ${locPcapSensorHostname}
        click    ${locPcapFirstSensorHostname}
        click    ${locPcapPreserveTimestamp}
        click    ${locPcapSensorInterface}
        click    ${locPcapEns224}
        click    ${locOverlayClick}
        shoot    Play Pcap Options
        click    ${locPcapExecuteBtn}
    END

Wait And Validate Kibana Hits
    log         Kibana needs time to populate results. Sleeping for 180 Seconds
    Sleep       180s
    Go To       ${KIBANA_IP}/app/discover#/?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-15m,to:now))&_a=(columns:!(),filters:!(),index:'filebeat-*',interval:auto,query:(language:kuery,query:''),sort:!(!('@timestamp',desc)))
    lookFor     Discover
    lookFor     Searching
    shoot       KibanaHits
    Sleep       10s
    shoot       KibinaHitsResults

Find Portal App Index
    [Arguments]  ${application_name}
    [Documentation]  Locates and returns index of application based on name supplied in argument.
    # Wait Until Element Is Visible  xpath=//*[contains(@id, "-app-card-div-div-div-h3-chart-application")]
    Navigate To Portal
    ${app_name_elements} =  Get WebElements  xpath=//*[contains(@id, "-dns")]
    log     Contains DNS: ${app_name_elements}
    ${index} =  Set Variable  ${0}
    FOR  ${element}  IN  @{app_name_elements}
        ${app_name} =  Get Text  ${element}
        log     \nApp Name: ${app_name}
        log     App Index: ${index}
        ${match}    ${value}     Run Keyword And Ignore Error  Should Contain     ${app_name}    ${application_name}
        IF      '${match}' == 'PASS'
            log     Match does contain: '${match}'
            Return From Keyword  ${index}
        ELSE
            log     This element is not a match for '${application_name}'
            ${index} =  Set Variable  ${index + 1}
        END

    END
    Return From Keyword  ${-1}

# Wrappers around selenium and robot functions
# all wrappers start with a lower case letter
getType
    [Arguments]        ${object}
    log                Retrieving the type of object ${object}
    ${object_type}     Evaluate                            type($object).__name__
    log                Object is of type ${object_type}
    [Return]           ${object_type}

click
    [Arguments]     ${element}     ${timeout}=5s
    Wait Until Page Contains Element    ${element}  timeout=${timeout}
    Click Element   ${element}
    log     Clicked element: ${element}

failTest
    Loggy.failure
    fail

type
    [Arguments]     ${element}      ${value}
    lookForElement  ${element}
    click           ${element}
    log     typeing the value ${value} into the element ${element} now!
    Input Text      ${element}      ${value}
    log     successfully typed the value ${value} into element ${element}!

waitAndClick
    [Arguments]     ${element}
    lookForElement  ${element}
    click   ${element}

scroll
    [Arguments]     ${element}
    log     Scrolling element ${element} into view!
    lookForElement  ${element}
    Scroll Element Into View    ${element}
    log     Element ${element} has been scrolled into view!

scrollAndClick
    [Arguments]     ${element}
    log     Scrolling element ${element} into view before clicking!
    lookForElement  ${element}
    Scroll Element Into View    ${element}
    log     Element ${element} has been scrolled into view!
    click   ${element}


gone
    [Documentation]     Waits until the specified text is not on the page anymore
    [Arguments]         ${text}     ${wait_time}=30s
    log     Waiting until the page no longer contains the text ${text}
    Wait Until Page Does Not Contain    ${text}     timeout=${wait_time}
    log     Text ${text} has disappeared like magic!


lookFor
    [Arguments]     ${text}     ${timeout}=30s      ${error}=None
    Wait Until Page Contains    ${text}     timeout=${timeout}      error=${error}
    log     Page Contains: ${text}

lookForElement
    [Arguments]     ${element}  ${timeout}=30s   ${error}=None   ${limit}=None
    log     Waiting For Element: ${element}
    Wait Until Page Contains Element    ${element}  timeout=${timeout}  error=${error}
    log     Found Element: ${element}

whenVisible
    [Arguments]     ${element}  ${timeout}=30s   ${error}=None   ${limit}=None
    log     Waiting For Element ${element} To Become Visible
    Wait Until Element Is Visible    ${element}  timeout=${timeout}  error=${error}
    log     Element ${element} Is Now Visible!

lower
    [Arguments]     ${text}
    log         Converting ${text} to all lowercase
    ${lowered_text}     Convert To Lower Case    ${text}
    log         Lowercase Conversion of ${text} to ${lowered_text} was a success!
    [Return]    ${lowered_text}

assertText
    [Arguments]     ${text}
    Page Should Contain     ${text}
    log     "Page Contains: ${text}"

getItemFromLocCount
    [Documentation]     Stringifies the ${sum} of ${times_list_element_seen} + ${addend} and replaces
    ...                 chars matching ${char_pattern} in ${template_object} with the result. Change
    ...                 the ${addend} to 0 in order to return the original ${times_list_element_seen}.
    ...                 By Default the ${addend} is -1 in order to make the result "array friendly".
    ...                 Returns ${desired_item}
    [Arguments]     ${list_element}     ${template_object}     ${char_pattern}=${DEFUALT_REPLACEMENT_PATTERN}  ${addend}=-1    ${wait_time}=30s
    log                 Finding how many times ${list_element} is seen on the page
    lookForElement      ${list_element}     timeout=${wait_time}
    ${times_list_element_seen}    Get Element Count    ${list_element}
    log                 Element ${list_element} is seen ${times_list_element_seen} times!
    log                 Calculating the the sum
    ${sum}              Evaluate    ${times_list_element_seen} + ${addend}
    log                 The sum is ${sum}
    log                 If this is unnsuccessful try changing the addend variable to 0
    ${replace_with}     Convert To String   ${sum}
    ${desired_item}     Replace String  ${template_object}   ${DEFUALT_REPLACEMENT_PATTERN}  ${replace_with}
    [Return]            ${desired_item}

inject
    [Documentation]     Injects the text into the given object using default replacement pattern
    ...                 Returns new object ${desired_item}
    [Arguments]     ${template_object}      ${injection}
    log                 Injecting the template object ${template_object} with string ${injection}!
    ${desired_item}     Replace String  ${template_object}  ${DEFUALT_REPLACEMENT_PATTERN}  ${injection}
    log                 Injection was successful
    log                 The new item is ${desired_item}
    [Return]            ${desired_item}


# inject count of ${first_element} into ${second_element} and wait ${wait_time}
#     log     injecting the count of ${first_element} into a field on ${second_element}
#     lookForElement  ${first_element}
#     ${count} =    Get Element Count    ${first_element}
#     log     the count of ${first_element} is ${count}
#     log     this function subtracts one from the count to conform with normal array counts
#     ${temp_replace_integer} =   Evaluate    ${count} - 1
#     ${replace_with} =       Convert To String   ${temp_replace_integer}
#     ${desired_element}=    Replace String    ${second_element}    ${DEFUALT_REPLACEMENT_PATTERN}     ${replace_with}
#     lookForElement     ${desired_element}      timeout=${wait_time}
    # ${desired}=    Replace String    ${second_element}    \\*\{7\}\\d     ********
    # ${desired_element}=    Replace String Using Regexp    ${desired}     \\*     X

log
    [Arguments]     ${text}    ${isError}=False
    Loggy.loggy     ${text}    ${isError}

shoot
    [Arguments]     ${name}
    log             Capturing Screenshot ${name}!
    SeleniumLibrary.Capture Page Screenshot    filename=${name}-screenshot-{index}.png


check
    [Arguments]     ${box}
    Select Checkbox     ${box}

uncheck
    [Arguments]     ${box}
    Select Checkbox     ${box}

clickAndWaitOnEnable
    [Arguments]     ${button}    ${wait_time}=3m
    log     Clicking Element And Waiting For It To Be Enabled ${button}
    lookForElement    ${button}
    Wait Until Element Is Enabled   ${button}   timeout=${wait_time}
    click  ${button}
    Element Should Be Disabled      ${button}
    Wait Until Element Is Enabled   ${button}   timeout=${wait_time}
    log     Element ${button} is enabled again

reload
    log     Reloading the page..
    Reload Page

pause
    [Arguments]     ${sleep_time}       ${text}=sleeping
    log     Sleeping for ${sleep_time}
    Sleep   ${sleep_time}       reason=${text}
    log     ${sleep_time} have passed! Done Sleeping!
