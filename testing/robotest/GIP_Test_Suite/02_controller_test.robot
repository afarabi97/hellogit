*** Settings ***
Library     SeleniumLibrary



*** Test Cases ***
Navigate To ONE Family
    Runner Open Browser         ${BROWSER}
    Capture Page Screenshot
    Close All Browsers

*** Keywords ***

Runner Open Browser
    [Arguments]     ${BROWSER}
    Log To Console              ${BROWSER}
    Log To Console  ${HOST}  
    

    Run Keyword If              'chrome' in '${BROWSER}'    Open Chrome     ${BROWSER}
    ...                         ELSE                        Open Firefox    ${BROWSER}


Open Chrome
    [Arguments]     ${BROWSER}
    ${chrome_options}   Evaluate            sys.modules['selenium.webdriver'].ChromeOptions()    sys, selenium.webdriver
    Call Method         ${chrome_options}   add_argument        no-sandbox
    Run Keyword If      'Headless' in '${BROWSER}'
    ...                 Call Method         ${chrome_options}   add_argument   headless
    ${BROWSER}=         Run Keyword If      'Headless' in '${BROWSER}'
    ... 		        Set Variable        chrome
    Call Method         ${chrome_options}   add_argument        gpu-disable
    Call Method         ${chrome_options}   add_argument        disable-dev-shm-usage
    ${options}          Call Method         ${chrome_options}   to_capabilities
    Open Browser        https://${HOST}/family  browser=${BROWSER}  desired_capabilities=${options}

Change Browser If Chrome Headless
    [Arguments]     ${BROWSER}
    Set Variable    ${BROWSER}          chrome
    [Return] 	    ${BROWSER}

Add Option Headless To Chrome
    [Arguments]     ${chrome_options}
    Call Method     ${chrome_options}   add_argument        headless
    [Return]        ${chrome_options}

Open Firefox
    [Arguments]     ${BROWSER}
    Open Browser    https://${HOST}/family  browser=${BROWSER}
    Log Location
