*** Settings ***
Resource    ../include/dipCommonVariables.resource
Resource    ./dipCatalogKeywords.resource

Library     Loggy.py            ${CATEGORY}    WITH NAME    loggy_obj
Library     SeleniumLibrary     15s    run_on_failure= loggy_obj.failure
Library     SSHLibrary          15s
Library     String
Library     Collections
Library     DateTime
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
        click    ${locPcapExecuteBtn}
    END

Wait And Validate Kibana Hits
    log         Kibana needs time to populate results. Sleeping for 180 Seconds
    Sleep       180s
    Go To       ${KIBANA_IP}/app/discover#/?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-15m,to:now))&_a=(columns:!(),filters:!(),index:'filebeat-*',interval:auto,query:(language:kuery,query:''),sort:!(!('@timestamp',desc)))
    lookFor     Discover
    ${curr_date} =  Get Current Date  time_zone=UTC  result_format=%b %d, %Y   #Ex: Mar 16, 2022
    ${locDocTableFirstRowDate} =  Set Variable  xpath=//*[@id="kibana-body"]//tbody/tr[1]/td[2]/div
    Wait Until Element Contains  ${locDocTableFirstRowDate}  ${curr_date}
    shoot       KibanaHits
    Sleep       10s
    shoot       KibinaHitsResults

Find Portal App Index
    [Arguments]  ${application_name}
    [Documentation]  Locates and returns index of application based on name supplied in argument.
    # Wait Until Element Is Visible  xpath=//*[contains(@id, "-cvah-application-card-div-div-div-h3-chart-application")]
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

# inject
#     [Documentation]     Injects the text into the given object using default replacement pattern
#     ...                 Returns new object ${desired_item}
#     [Arguments]     ${template_object}      ${injection}    ${replacement_pattern}=${DEFUALT_REPLACEMENT_PATTERN}
#     log                 Injecting the template object: ${template_object} with string: ${injection}, using replacement_pattern: ${replacement_pattern}!
#     ${desired_item}     Replace String  ${template_object}  ${DEFUALT_REPLACEMENT_PATTERN}  ${injection}
#     log                 Injection was successful
#     log                 The new item is ${desired_item}
#     [Return]            ${desired_item}


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

#########################
# STATE MACHINE HELPERS #
#########################
# shouldExecuteStateChange
#     [Arguments]         ${current_state}          ${target_state}       ${msg}=ruleset
#     [Documentation]     Evaluates the state of an object. Return True if the object
#     ...                 has reached the expected state and False if it has not.
#     log         Evaluating current and target ${msg} states
#     log         Current ${msg} State: ${current_state}
#     log         Target ${msg} State: ${target_state}

#     IF      '${current_state}' == '${target_state}'
#         log       MATCHING Current and Target ${msg} States!
#         Return From Keyword    ${fALSE}
#     ELSE
#         log       DIFFERENT Current and Target ${msg} States!
#         Return From Keyword    ${False}
#     END


# shouldExecuteSensorsStateChange
#     [Arguments]         ${current_state}          ${target_state}       ${msg}=ruleset_sensors
#     [Documentation]     Evaluates the state of a rulesets sensors. Return True if the object
#     ...                 has reached the expected state and False if it has not.
#     ...                 If there are no sensors, they have none assigned. If target_state is
#     ...                 True, Assign all Sensors
#     ...                 False, Dissassociate all Sensors

#     # 'zeek_script': {'ruleset_id': '6e9f4fe8fea74fe7ba21ad46f6868643', 'ruleset_name': 'Zeek Sample Scripts', 'ruleset_enabled': False, 'ruleset_sensors': [{'hostname': 'brandon-sensor3.clarke', 'mac': 'ba:d4:7c:40:16:ee', 'management_ip': '10.40.18.70'}], 'ruleset_state': 'Dirty'}
#     log         Evaluating current and target ${msg} states
#     log         Current ${msg} State: ${current_state}
#     log         Target ${msg} State: ${target_state}


#     # If target_state is True that means we want to enable all possible sensors
#     # To determine if we need to do anything, compare all sensors to the list
#     # of sensors currently assigned to the Ruleset

#     # Get all sensors
#     ${sensor_info_response}=    Get Sensor Info
#     log         shouldExecuteSensorsStateChange - sensor_info_response: ${sensor_info_response}

#     # ${current_state}

#     # IF      '${current_state}' == '${target_state}'
#     #     log       MATCHING Current and Target ${msg} States!
#     #     Return From Keyword    ${fALSE}
#     # ELSE
#     #     log       DIFFERENT Current and Target ${msg} States!
#     #     Return From Keyword    ${False}
#     # END
#     [Return]    ${False}


# Get Sensors State
#     ${response}=    Get Sensor Info
#     {sensor_info_state}=    Create List

#     log     Get The Sensors Info State
#     FOR  ${item}  IN  @{response}
#         log         Creating Local Ruleset Dictionary
#         ${localRulesetDict}=        Create Dictionary
#         Set To Dictionary   ${localRulesetDict}     ruleset_id=${item}[_id]
#         Set To Dictionary   ${localRulesetDict}     ruleset_name=${item}[name]
#         Set To Dictionary   ${localRulesetDict}     ruleset_enabled=${item}[isEnabled]
#         Set To Dictionary   ${localRulesetDict}     ruleset_sensors=${item}[sensors]
#         Set To Dictionary   ${localRulesetDict}     ruleset_state=${item}[state]
#         IF      '${item}[appType]' == 'Suricata'
#             log         Add Suricata to sensor_info_state
#             Set To Dictionary   ${sensor_info_state}         suricata=&{localRulesetDict}
#             log         Successfully Added Suricata to sensor_info_state

#         ELSE IF     '${item}[appType]' == 'Zeek Scripts'
#             log         Add Zeek Script to sensor_info_state
#             Set To Dictionary   ${sensor_info_state}         zeek_script=&{localRulesetDict}
#             log         Successfully Added Zeek Script to sensor_info_state

#         ELSE IF     '${item}[appType]' == 'Zeek Signatures'
#             log         Add Zeek Signature to sensor_info_state
#             Set To Dictionary   ${sensor_info_state}         zeek_signature=&{localRulesetDict}
#             log         Successfully Added Zeek Signature to sensor_info_state
#         END
#     END
#     log         Successfully returning the rulesets state (sensor_info_state): ${sensor_info_state}
#     [Return]    ${sensor_info_state}


#########################
# API REQUEST WRAPPERS  #
#########################
# API Get
#     [Arguments]         ${endpoint}
#     [Documentation]     Wrapper for GET Requests To Our API
#     log     Executing A Get Request On API Endpoint: ${endpoint}
#     ${url}=     Format String   ${API_BASE_URL}   endpoint=${endpoint}
#     log     Retrieving Response From ${url}
#     # ${response}=    Api.current user    ${host}
#     ${response}=    GET   url=${url}    headers=${API_HEADER}
#     log     Successfully Retrieved Response From API Endpoint: ${url}
#     [Return]    ${response}


# GET Current User
#     ${response}=    API Get  ${current_user_endpoint}
#     log             Get Current User Response JSON: ${response.json()}
#     [Return]    ${response.json()}

# GET Sensor Info
#     ${response}=    API Get  ${sensor_info_endpoint}
#     log             Get Sensor Info Response JSON: ${response.json()}
#     [Return]    ${response.json()}

# GET Rulesets
#     ${response}=    API Get  ${rulesets_endpoint}
#     log             Get Rulesets Response JSON: ${response.json()}
#     [Return]    ${response.json()}





