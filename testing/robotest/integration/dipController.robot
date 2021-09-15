*** Settings ***
Documentation          Test suite for the virtual DIP controller. The following tests are ran through the
...                    GitLab pipeline and results posted on TFPLENUM Zepher account.
...
...                    Notice how connections are handled as part of the suite setup and
...                    teardown. This saves some time when executing several test cases.

Resource    ../lib/dipCommonKeywords.resource
Resource    ../lib/dipCatalogKeywords.resource
Resource    ../include/dipCatalogVariables.resource

Library     SeleniumLibrary     15s
Library     SSHLibrary          15s
Library     String


Suite Setup         Open SSH Connection  ${HOST}  ${HOST_USERNAME}  ${HOST_PASSWORD}
Test Setup          Run Keywords  Runner Open Browser  ${HOST}  ${BROWSER}
                    ...  AND  Set DIP Kit Global Variables
Test Teardown       Close Browser
Suite Teardown      Run Keywords  Clean Up Catalog Page
                    ...  AND  Close All Connections


*** Test Cases ***
Perform Initial SSO for DIP Controller
    [Tags]    THISISCVAH-7528
    [Documentation]    Grabs the SSO administrator password from the user's controller and performs initial SSO.
    ...                Logs into the DIP controller, accepts banner page, and updates the password when prompted.
    ${sso_pword} =  Execute Command  cat ${SSO_FILE}  # Retrieves the SSO password from the text file
    Login Into DIP Controller  ${SSO_ADMIN_USERNAME}  ${sso_pword}
    Accept DoD Banner
    Update Password

Run Elastic Integration Test
    [Tags]    THISISCVAH-10191
    [Documentation]    Grab the elastic password and run some tests
    Set Selenium Speed  0.5s
    Login Into DIP Controller    ${SSO_ADMIN_USERNAME}  ${NEW_SSO_ADMIN_PASSWORD}
    Wait Until Page Contains    Portal
    ${portal_location} =    Get Location
    Install Multiple Apps  Logstash  Zeek  Suricata  Arkime-viewer  Arkime
    Go To    ${portal_location}

    Wait Until Page Contains Element    ${locKibanaUserPassword}
    ${kibana_user_password_full_text} =  Get Text    ${locKibanaUserPassword}
    ${kibana_ip} =  Get Text    ${locKibanaKitIP}
    ${kibana_password} =    Get Substring    ${kibana_user_password_full_text}    23    end=None
    Go To    ${kibana_ip}

    # TODO: Make this section only run if we are not logged-in
    Wait Until Page Contains    Welcome to Elastic    timeout=15s    error=None
    Click Element    ${locElasticLoginButton}
    Wait Until Page Contains    Username    timeout=6s    error=None
    Input Text    //input[@name="username"]    ${KIBANA_USERNAME}
    Input Text    //input[@name="password"]    ${kibana_password}
    Click Element    //span[@class="euiButton__text"]

    Wait Until Page Contains    Hunt    timeout=6s    error=None
    Click Element    //a[normalize-space()='Hunt']
    Wait Until Page Contains    Home    timeout=6s    error=None
    ${hunt_location} =    Get Location
    Click Element    xpath=(//button[@class="euiButtonEmpty euiButtonEmpty--text euiHeaderSectionItemButton"])[3]
    Click Element    //span[@title="Stack Management"]
    Wait Until Page Contains    Welcome to Stack Management    timeout=6s    error=None
    SeleniumLibrary.Capture Page Screenshot    filename=StackManagement-screenshot-{index}.png

    # Go back to portal page AND Play the pcap
    Go To    ${portal_location}
    Wait Until Page Contains    Portal    timeout=8s    error=None
    Click Element    //mat-icon[@id="app-top-navbar-mat-drawer-container-mat-drawer-mat-list-div-3-mat-list-item-1-mat-icon"]
    Wait Until Page Contains    Test Files
    Click Element    //em[@id="app-pcap-form-div-mat-card-mat-card-content-table-td-7-action-button-play-arow-em"]
    Wait Until Page Contains    Replay PCAP on target Sensor    timeout=2s    error=None
    Click Element    id=replay-pcap-dialog-div-mat-form-field-sensor-hostname-mat-select
    Click Element    //span[@class="mat-option-text"]
    Click Element    xpath=(//span[@class="mat-button-wrapper"])[24]
    SeleniumLibrary.Capture Page Screenshot    filename=Wannacry-screenshot-{index}.png

    # after about 2 minutes
    # go back to kibana and click on discover
    # should see green bar depicting file beat traffic when pcap was played
    # TODO: Figure out a better way of seeing if it was a hit. Right now we have to confirm via screenshot
    Sleep     180s
    Go To    ${kibana_ip}/app/discover#/?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-15m,to:now))&_a=(columns:!(),filters:!(),index:'filebeat-*',interval:auto,query:(language:kuery,query:''),sort:!(!('@timestamp',desc)))
    Wait Until Page Contains    Discover    timeout=15s    error=None
    Wait Until Page Does Not Contain    Searching    timeout=15s    error=None
    SeleniumLibrary.Capture Page Screenshot    filename=KibanaHits-screenshot-{index}.png

    # Uninstall the applications
    Go To    ${portal_location}
    Wait Until Page Contains    Portal    timeout=8s    error=None
