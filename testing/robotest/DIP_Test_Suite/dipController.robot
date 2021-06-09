*** Settings ***
Documentation          Test suite for the virtual DIP controller. The following tests are ran through the
...                    GitLab pipeline and results posted on TFPLENUM Zepher account.
...
...                    Notice how connections are handled as part of the suite setup and
...                    teardown. This saves some time when executing several test cases.

Resource    ../lib/dipCommonKeywords.resource
Resource    ../lib/dipCatalogKeywords.resource
Resource    ../include/dipCatalogVariables.resource

Library     SeleniumLibrary     30s    run_on_failure=NONE
Library     SSHLibrary          15s
Library     String


Suite Setup         Open SSH Connection  ${HOST}  ${HOST_USERNAME}  ${HOST_PASSWORD}
Test Setup          Runner Open Browser  ${HOST}  ${BROWSER}
Test Teardown       Close Browser
Suite Teardown      Close All Connections


*** Test Cases ***
Perform Initial SSO for DIP Controller
    [Tags]    THISISCVAH-7528
    [Documentation]    Grabs the SSO administrator password from the user's controller and performs initial SSO.
    ...                Logs into the DIP controller, accepts banner page, and updates the password when prompted.
    ${sso_pword} =  Execute Command  cat ${SSO_FILE}  # Retrieves the SSO password from the text file
    Login Into DIP Controller  ${SSO_ADMIN_USERNAME}  ${sso_pword}
    Accept DoD Banner
    Update Password

Verify Correct System Name And Version Number
    [Tags]    THISISCVAH-8225
    [Documentation]    Test to check that controller has correct system name and version number.
    ...                Also checks that the Service Now web address is correct.
    Login Into DIP Controller    ${SSO_ADMIN_USERNAME}  ${NEW_SSO_ADMIN_PASSWORD}
    Wait Until Page Contains    Portal
    Click Element    ${locSupportPageNavIcon}
    Wait Until Element Contains  ${locSystemVersionNumber}  ${KIT_VERSION}
    Element Should Contain    ${locServiceNowURL}  https://afdco.servicenowservices.com/sp

Install And Uninstall Apps From Catalog Page
    [Tags]    THISISCVAH-8137
    [Documentation]    Download apps from Catalog page and verify successful download within Notifications & Health pages
    Login Into DIP Controller    ${SSO_ADMIN_USERNAME}  ${NEW_SSO_ADMIN_PASSWORD}
    Wait Until Page Contains    Portal
    Set Selenium Speed  0.5s
    Set DIP Kit Global Variables

    Download App From Catalog    Arkime-viewer  ${locArkimeViewerConfigAppBtn}
    Verify App Has Been Installed    Arkime-viewer  ${locArkimeViewerAppCard}  ${locArkimeViewerAppCardCircle}
    Download App From Catalog    Arkime  ${locArkimeConfigAppBtn}
    Verify App Has Been Installed    Arkime  ${locArkimeAppCard}  ${locArkimeAppCardCircle}
    Uninstall App    Arkime  ${locArkimeAppCard}  ${locArkimeConfigAppBtn}
    Uninstall App    Arkime-viewer  ${locArkimeViewerAppCard}  ${locArkimeViewerConfigAppBtn}

    Download App From Catalog    Cortex  ${locCortexConfigAppBtn}
    Verify App Has Been Installed    Cortex  ${locCortexAppCard}  ${locCortexAppCardCircle}
    Uninstall App    Cortex  ${locCortexAppCard}  ${locCortexConfigAppBtn}

    Download App From Catalog    Hive  ${locHiveConfigAppBtn}
    Verify App Has Been Installed    Hive  ${locHiveAppCard}  ${locHiveAppCardCircle}
    Uninstall App    Hive  ${locHiveAppCard}  ${locHiveConfigAppBtn}

    Download App From Catalog    Jcat-nifi  ${locJcatNifiConfigAppBtn}
    Verify App Has Been Installed    Jcat-nifi  ${locJcatNifiAppCard}  ${locJcatNifiAppCardCircle}
    Uninstall App    Jcat-nifi  ${locJcatNifiAppCard}  ${locJcatNifiConfigAppBtn}

    Download App From Catalog    Logstash  ${locLogstashConfigAppBtn}
    Verify App Has Been Installed    Logstash  ${locLogstashAppCard}  ${locLogstashAppCardCircle}
    Uninstall App    Logstash  ${locLogstashAppCard}  ${locLogstashConfigAppBtn}

    Download App From Catalog    Misp  ${locMispConfigAppBtn}
    Verify App Has Been Installed    Misp  ${locMispAppCard}  ${locMispAppCardCircle}
    Uninstall App    Misp  ${locMispAppCard}  ${locMispConfigAppBtn}

    Download App From Catalog    Rocketchat  ${locRocketchatConfigAppBtn}
    Verify App Has Been Installed    Rocketchat  ${locRocketchatAppCard}  ${locRocketchatAppCardCircle}
    Uninstall App    Rocketchat  ${locRocketchatAppCard}  ${locRocketchatConfigAppBtn}

    Download App From Catalog    Suricata  ${locSuricataConfigAppBtn}
    Verify App Has Been Installed    Suricata  ${locSuricataAppCard}  ${locSuricataAppCardCircle}
    Uninstall App    Suricata  ${locSuricataAppCard}  ${locSuricataConfigAppBtn}

    Download App From Catalog    Wikijs  ${locWikijsConfigAppBtn}
    Verify App Has Been Installed    Wikijs  ${locWikijsAppCard}  ${locWikijsAppCardCircle}
    Uninstall App    Wikijs  ${locWikijsAppCard}  ${locWikijsConfigAppBtn}

    Download App From Catalog    Zeek  ${locZeekConfigAppBtn}
    Verify App Has Been Installed    Zeek  ${locZeekAppCard}  ${locZeekAppCardCircle}
    Uninstall App    Zeek  ${locZeekAppCard}  ${locZeekConfigAppBtn}