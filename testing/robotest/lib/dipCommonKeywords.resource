*** Settings ***
Resource    ../include/dipCommonVariables.resource
Resource    ./dipCatalogKeywords.resource
Variables    ../include/element_ids_frontend.py

Library     Loggy.py            ${CATEGORY}    WITH NAME    loggy_obj
Library     SeleniumLibrary     15s    run_on_failure= loggy_obj.failure
Library     SSHLibrary          15s
Library     String
Library     Collections
Library     TFPlenumLibrary.py


*** Keywords ***
Set DIP Kit Global Variables
    [Documentation]  Checks if kit is bare-metal or virtual and sets global variables
    ${first_3_chars} =  Get Substring  ${PIPELINE}  0  3
    ${IS_BARE_METAL_KIT} =  Set Variable If  '${first_3_chars}' == 'hw-'  ${True}  ${False}
    Set Global Variable  ${IS_BARE_METAL_KIT}

Generate Global API Auth Token
    [Documentation]     Generates an API Token with the following roles: "controller-admin,controller-maintainer,operator"
    log     Generating API Auth Token with roles (controller-admin, controller-maintainer, operator) and an expiration time of 1 hour

    ${API_TOKEN}=  Execute Command    ${API_CMD}
    log     Successfully Generated API Auth Token: ${API_TOKEN}
    log     Setting Global Variable API_TOKEN
    Set Global Variable  ${API_TOKEN}
    log     Successfully Set Global Variable API_TOKEN

    log     Setting Global API Header

    log     Creating Empty Dictionary API_HEADER
    ${API_HEADER}=    Create Dictionary

    log     Constructing API Header Value
    ${API_HEADER_VALUE}=    Format String   Bearer {bearer_token}   bearer_token=${API_TOKEN}
    log     Successfully Constructed The API Header Value: ${API_HEADER_VALUE}

    log     Setting The Value of The API Authentication Key (${API_HEADER_KEY}) to The API Header Value: ${API_HEADER_VALUE}
    Set To Dictionary   ${API_HEADER}   ${API_HEADER_KEY}=${API_HEADER_VALUE}
    Log Dictionary      ${API_HEADER}
    log     Successfully Created API_HEADER
    log     API Header: ${API_HEADER}


    log     Lastly, Make API_HEADER a Global Variable
    Set Global Variable  ${API_HEADER}
    log     Successfully Set Global Variable API_HEADER

    log     Successfully Generated Global API Auth Token!

Open SSH Connection
    [Arguments]  ${host}  ${host_username}  ${host_password}
    [Documentation]  Perform The Suite Setup Functionality of Setting The Log Level, And SSH'ing Into The Host, Generate Auth Token
    Open Connection     ${host}
    Login               ${host_username}  ${host_password}
    Generate Global API Auth Token

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

Stay Or Go To ${page}
    [Documentation]     Use this if you don't want to refresh the browser if you're already at the specified page


Navigate To ${page}
    log         "Navigating To: ${page} Page"

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
        whenVisible     ${locNodeMgmtTable}     timeout=60s     error=Node Management Page did not load within 60s
    ELSE IF     "${page}" == "Alerts"
        Go To    ${Alerts}
        lookFor  Hive Settings
    ELSE IF     "${page}" == "Health"
        Go To           ${Health}
        lookFor         Managed Kits
     ELSE IF     "${page}" == "Catalog"
        Go To           ${Catalog}
        lookFor         Catalog
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

Log In To Kibana
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
    ${sensor_name} =  Check For Sensor With Available Interface
    IF      "${pcap}" == "Wannacry"
        click    ${locPcapPlayBtn}
        click    ${locPcapSensorHostname}
        click    xpath=//span[contains(text(),"${sensor_name}")]
        click    ${locPcapPreserveTimestamp}
        click    ${locPcapSensorInterface}
        click    ${locPcapSensorInterfaceOptn}
        Press Keys  None  TAB
        shoot    Play Pcap Options
        Click Button    id=${CVAH_REPLAY_PCAP_DIALOG__BUTTON_EXECUTE}  # execute btn
    END

Wait And Validate Kibana Hits
    log         Kibana needs time to populate results. Sleeping for 180 Seconds
    Sleep       180s
    Go To       ${KIBANA_IP}/app/discover#/?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-15m,to:now))&_a=(columns:!(),filters:!(),index:'filebeat-*',interval:auto,query:(language:kuery,query:''),sort:!(!('@timestamp',desc)))
    lookFor     Discover
    ${locDocTableFirstRowDate} =  Set Variable  xpath=//*[@id="kibana-body"]//tbody/tr[1]/td[2]/div
    lookForElement  ${locDocTableFirstRowDate}  2m
    shoot       KibanaHits
    Sleep       10s
    shoot       KibinaHitsResults

Find Portal App Index
    [Arguments]  ${application_name}
    [Documentation]  Locates and returns index of application based on name supplied in argument.
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
    [Arguments]     ${element}     ${timeout}=30s
    Wait Until Page Contains Element    ${element}  timeout=${timeout}
    Click Element   ${element}
    log     Clicked element: ${element}

failTest
    loggy_obj.failure
    fail

clickElements
    [Arguments]     ${elements_locator}     ${timeout}=30s
    log     Retrieving Elements using locator: ${elements_locator}
    ${elements} =      Get Web Elements    ${elements_locator}
    FOR  ${element}  IN  @{elements}
        click   ${element}
    END
    log     Finished Clicking Elements Retrieved using locator: ${elements_locator}


type
    [Arguments]     ${element}      ${value}        ${clear_before}=${FALSE}
    log     Inputting Text Into Element: ${element}
    lookForElement  ${element}
    IF      ${clear_before}
        log     Clearing Text
        ${previous_text}    Get Text    ${element}
        log         Element ${element} Contained The Text: ${previous_text}
        Clear Element Text      ${element}
        log     Clear Element Text has been performed on Element ${element}
    END
    log     Inputting value ${value} into Element: ${element} now!
    click           ${element}
    Input Text      ${element}      ${value}
    log     successfully typed the value ${value} into element ${element}!

clearAndType
    [Arguments]     ${element}      ${value}
    lookForElement      ${element}
    click               ${element}
    ${previous_text}    Get Text    ${element}
    log     Clearing Text | Element: ${element} | Previous Text: ${previous_text}
    Clearing Element Text
    lookForElement  ${element}
    click           ${element}
    Clv

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

log
    [Arguments]     ${text}    ${isError}=False
    loggy_obj.loggy     ${text}    ${isError}

logDict
    [Arguments]     ${text}=""     ${dictionary}={}
    loggy_obj.loggy     Logging Dictionary ${text}: ${dictionary}
    FOR    ${key}    IN    @{dictionary}
        log    ${key}=${dictionary}[${key}]
    END

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
