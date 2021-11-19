*** Settings ***
Resource    ../include/dipAlertsVariables.resource
Resource    ../include/dipCommonVariables.resource

Library    RequestsLibrary
Library    SeleniumLibrary    15s
Library    SSHLibrary         15s
Library    String
Library    Collections
Library    Sorter.py

*** Keywords ***
Log In To Hive
    log  Logging in to the Hive
    create session  Hive    ${HIVE_IP}  disable_warnings=1
    &{data}=    Create dictionary   user=${HIVE_USERNAME}    password=${HIVE_PASSWORD}
    ${resp}=    POST On Session    Hive    /api/login  json=${data}

    # Login successful - saving cookie
    ${cookie_value}=    get from dictionary     ${resp.cookies}     THEHIVE-SESSION
    ${cookie_value}=    Catenate    SEPARATOR=    THEHIVE-SESSION     =       ${cookie_value}
    Set Global Variable     ${cookie_value}

Retrieve Hive Users
    log  Retrieving User Information
    ${headers}=     Create dictionary   Content-Type    application/json   Cookie  ${cookie_value}
    ${json_string}=    Catenate    {"query": [{"_name": "listOrganisation"},{"_name": "users"}]}        # Note: A dictionary has to be passed in for the json - a string that looks like json is not good enough
    ${json}=             evaluate        json.loads('''${json_string}''')    json
    create session  Hive    ${HIVE_IP}  disable_warnings=1
    ${resp}=  POST On Session    Hive    /api/v1/query   params=name=users   json=${json}   headers=${headers}

    # Users retrieved successfully - saving data
    FOR  ${member}  IN  @{resp.json()}
        ${login}=  Get From Dictionary  ${member}  login
        IF  '${login}' == '${ADMIN_PROFILE}'
            ${admin_id}=    Get From Dictionary  ${member}  _id
            Set Global Variable  ${admin_id}
        ELSE IF  '${login}' == '${ORG_ADMIN_PROFILE}'
            ${org_admin_id}=    Get From Dictionary  ${member}  _id
            Set Global Variable  ${org_admin_id}
        END
    END

Obtain and Utilize Hive Keys
    Get Hive IP
    Log In To Hive
    Retrieve Hive Users
    log  Creating API Keys
    # Create and Save Admin API Key
    ${headers}=     Create dictionary   Cookie  ${cookie_value}
    create session  Hive    ${HIVE_IP}  disable_warnings=1
    ${resp}=  POST On Session    Hive    /api/v1/user/${admin_id}/key/renew  headers=${headers}
    ${admin_api_key}=  Set Variable  ${resp.text}
    Set Global Variable  ${admin_api_key}
    # Create and Save Org Admin API Key
    create session  Hive    ${HIVE_IP}  disable_warnings=1
    ${resp}=  POST On Session    Hive    /api/v1/user/${org_admin_id}/key/renew  headers=${headers}
    ${org_admin_api_key}=  Set Variable  ${resp.text}
    Set Global Variable  ${org_admin_api_key}
    Go To    ${Alerts}
    lookFor  Security Alerts
    click    ${locHiveSettings}
    lookFor  Hive Settings
    type     ${locHiveAdminAPIKeyInput}   ${admin_api_key}
    type     ${locHiveOrgAdminAPIKeyInput}   ${org_admin_api_key}
    shoot    HiveSettings
    click    ${locHiveSettingsSaveBtn}
    log      Keys have been successfully saved to Hive Settings

Verify Play Stop and Refresh Button
    ${AllButtonsWorkingProperly} =  Set Variable  True
    ${PlayBtnIsWorking} =           Set Variable  False
    ${StopBtnIsWorking} =           Set Variable  False
    ${RefreshBtnIsWorking} =        Set Variable  False
    Navigate to Alerts
    Get Total Alert Count
    ${initialAlertCount}=  Set Variable  ${totalAlertCount}
    Navigate To PCAPs
    log  Playing "Wannacry" PCAP
    Play Wannacry PCAP
    Navigate To Alerts

    log  Verification of the play button
    ${State}=  Get Text  ${locAlertsPlayAndStopBtn}
    IF  '${State}' != 'stop'
        click  ${locAlertsPlayAndStopBtn}
    END
    log  Pausing for 1 minute a max of 30 times
    FOR  ${i}  IN RANGE  1  30
        Get Total Alert Count
        IF  '${initialAlertCount}' != '${totalAlertCount}'
            ${PlayBtnIsWorking}=  Set Variable  True
            exit for loop
        ELSE
            pause  60s  Wait For Alerts
        END
    END

    log  Verification of the stop button
    # Verify stop button is pressed before playing a new pcap file
    ${State}=  Get Text  ${locAlertsPlayAndStopBtn}
    IF  '${State}' == 'stop'
        click  ${locAlertsPlayAndStopBtn}
    END
    Navigate To PCAPs
    log  Playing "Wannacry" PCAP
    Play Wannacry PCAP
    Navigate To Alerts
    # Verify that navigating to a different page has not changed the state of the stop button
    ${State}=  Get Text  ${locAlertsPlayAndStopBtn}
    IF  '${State}' == 'stop'
        click  ${locAlertsPlayAndStopBtn}
    END
    Get Total Alert Count
    ${initialAlertCount}=  Set Variable  ${totalAlertCount}
    pause  3m  Wait For Alerts
    Get Total Alert Count
    IF  '${initialAlertCount}' == '${totalAlertCount}'
        ${StopBtnIsWorking} =  Set Variable  True
    END

    log  Verification of the refresh button
    log  Pausing for 1 minute a max of 30 times
    FOR  ${i}  IN RANGE  1  30
        Get Total Alert Count
        click    ${locAlertsRefreshBtn}
        lookFor  Successfully updated Alerts table!
        Get Total Alert Count
        IF  '${initialAlertCount}' != '${totalAlertCount}'
            ${RefreshBtnIsWorking}=  Set Variable  True
            exit for loop
        ELSE
            pause  60s  Wait For Alerts
        END
    END

    # Logs for each button
    IF  '${PlayBtnIsWorking}' == 'True'
        log  Play Button: | Pass |
    ELSE
        log  Play Button: | Fail |     True
    END

    IF  '${StopBtnIsWorking}' == 'True'
        log  Stop Button: | Pass |
    ELSE
        log  Stop Button: | Fail |    True
    END

    IF  '${RefreshBtnIsWorking}' == 'True'
        log  Refresh Button: | Pass |
    ELSE
        log  Refresh Button: | Fail |   True
    END

    shoot  Alerts Page

    #Final Assertion
    IF  '${PlayBtnIsWorking}'=='False' or '${StopBtnIsWorking}'=='False' or '${RefreshBtnIsWorking}'=='False'
        ${AllButtonsWorkingProperly}=  Set Variable  False
    END
    Run Keyword If  '${AllButtonsWorkingProperly}'=='False'  failTest

Get Total Alert Count
    # Get original state - stop the page from refreshing while getting alert count
    ${State}=  Get Text  ${locAlertsPlayAndStopBtn}
    IF  '${State}' == 'stop'
        click  ${locAlertsPlayAndStopBtn}
    END

    log  Getting Total Number of Alerts

    # Get the nmumber of rows and columns - both are used as edge cases in the following loops
    ${rows}  Get Element Count  ${locTableRows}
    ${columns}  Get Element Count  ${locTableHeaders}

    # Find which column is the "count" column. ${countColumnNum} is referring to the column number that applies to the column header with the text "count"
    ${countColumnNum}=  Set Variable  0
    FOR  ${columnNum}  IN RANGE  ${columns}
        ${headerXpath}=  Catenate  SEPARATOR=  ${locTableHeaders}  [  ${columnNum+1}  ]
        ${headerName}=  Get Text  ${headerXpath}
        CONTINUE FOR LOOP IF  '${headerName}' != 'count'
        ${countColumnNum}=  Set Variable  ${columnNum+1}
        exit for loop
    END

    # add all rows of the "count" column together
    ${totalAlertCount}=  Set Variable  ${0}
    FOR  ${rowNum}  IN RANGE  ${rows}
        ${tableEntryXpath}=  Catenate  SEPARATOR=  ${locTableRows}   [  ${rowNum+1}  ]  /td[  ${countColumnNum}  ]
        ${tableEntryValue}=  Get Text  ${tableEntryXpath}
        ${tableEntryValue}=  Convert To Integer  ${tableEntryValue}
        ${totalAlertCount}=  Evaluate  ${tableEntryValue}+${totalAlertCount}
    END
    # Since Robot cannot return variables, we do this instead.
    Set Global Variable  ${totalAlertCount}

    # Reset to original state
    IF  '${State}' == 'stop'
        click  ${locAlertsPlayAndStopBtn}
    END

Verify Table Sorting
    # Get original state - stop page from refreshing while validating sorting
    ${State}=  Get Text  ${locAlertsPlayAndStopBtn}
    IF  '${State}' == 'stop'
        click  ${locAlertsPlayAndStopBtn}
    END

    # Initial Variables
    ${rows}  Get Element Count  ${locTableRows}
    ${columns}  Get Element Count  ${locTableHeaders}

    # Can't sort rows if you don't have any!
    IF  '${rows}' <= '1'
        log  Number of rows needs to be greater than 1 in order to sort. Number of rows is currently: ${rows}   true
        failTest
    END

    FOR  ${columnNum}  IN RANGE  ${columns}
        # Sort Normally
        CONTINUE FOR LOOP IF  ${columnNum} == 0
        log  Verifying Column ${columnNum}
        ${sortButton}=  Catenate  SEPARATOR=  ${locTableHeaders}  [${columnNum+1}]
        click  ${sortButton}
        ${values}=  Create List
        FOR  ${rowNum}  IN RANGE  ${rows}
            ${tableEntry}=  Catenate  SEPARATOR=  ${locTableRows}   [  ${rowNum+1}  ]  /td[${columnNum+1}]
            ${temp}=  Get Text  ${tableEntry}
            Append To List  ${values}  ${temp}
        END
        ${sortedValues}=  Sorter.sort  ${values}
        Lists Should Be Equal  ${sortedValues}  ${values}

        # Reverse Sort
        log  Verifying Column ${columnNum} Reversely
        click  ${sortButton}
        ${values}=  Create List
        FOR  ${rowNum}  IN RANGE  ${rows}
            ${tableEntry}=  Catenate  SEPARATOR=  ${locTableRows}   [  ${rowNum+1}  ]  /td[${columnNum+1}]
            ${temp}=  Get Text  ${tableEntry}
            Append To List  ${values}  ${temp}
        END
        ${sortedValues}=  Sorter.reverseSort  ${values}
        Lists Should Be Equal  ${sortedValues}  ${values}
    END




