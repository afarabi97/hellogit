*** Settings ***
Resource    ../../lib/dipCommonKeywords.resource
Resource    ../../lib/dipRulesetKeywords.resource
Resource    ../../lib/dipElasticKeywords.resource

Library    SeleniumLibrary    15s
Library    SSHLibrary         15s
Library    String
Library    Collections


Suite Setup       Open SSH Connection      ${HOST}                ${HOST_USERNAME}                ${HOST_PASSWORD}
Test Setup        Run Keywords             Runner Open Browser    ${HOST}                         ${BROWSER}
                  ...                      AND                    Set DIP Kit Global Variables
                  ...                      AND                    Login Into DIP Controller  ${SSO_ADMIN_USERNAME}    ${NEW_SSO_ADMIN_PASSWORD}
Test Teardown     Close Browser
Suite Teardown    Close All Connections

*** Test Cases ***
Run Elastic Integration Test
    [Tags]                           THISISCVAH-10191
    [Documentation]                  Grab the elastic password and run some tests
    Set Selenium Speed               1s
    Install Multiple Apps            Logstash   Zeek    Suricata    Arkime-viewer    Arkime
    Log In To Kibana
    Navigate To PCAPs
    Play Wannacry PCAP
    Wait And Validate Kibana Hits
    Navigate To Portal

Check MinIO (Elastic) Backup Capability
    Set Selenium Speed  0.5s
    Go To  https://${host}/index_management
    click  ${CVAH_ELASTICSEARCH_INDEX_MANAGEMENT_MAT_SELECT_ACTION}
    click  xpath=//span[text() = "Backup and close"]
    click  ${CVAH_ELASTICSEARCH_INDEX_MANAGEMENT_BUTTON_NEXT}
    click  ${CVAH_ELASTICSEARCH_INDEX_MANAGEMENT_MAT_SELECT_LIST}
    ${index_name_list} =  Create List
    Wait Until Element Is Visible  xpath=//mat-option
    ${index_elements} =  Get WebElements  xpath=//mat-option
    FOR  ${element}  IN  @{index_elements}
        ${element_text} =  Get Text  ${element}
        ${name}  ${size} =  Split String  ${element_text}
        Append To List  ${index_name_list}  ${name}
        click  ${element}
    END
    Press Keys  None  ESCAPE
    log  ${index_name_list}
    click  ${CVAH_ELASTICSEARCH_INDEX_MANAGEMENT_BUTTON_UPDATE}
    Sleep  5s
    lookFor  Curator job submitted check notifications for progress.
    click  ${APP_TOP_NAVBAR__MAT_LIST_ITEM_NOTIFICATIONS_MAT_ICON}
    Wait Until Element Contains  ${locTopNotificationMsg}  Curator Backup Indices job completed.
    ${closed_list} =  Get Closed Elastic Indexes  ${HOST}  ${HOST_PASSWORD}
    log  ${closed_list}
    Lists Should Be Equal  ${index_name_list}  ${closed_list}  ignore_order=True
Run Index Management Test
    [Tags]                           THISISCVAH-12853
    [Documentation]                  Run Index Management Tests
    Set Selenium Speed               0.5s
    Install Multiple Apps            Zeek    Suricata
    Close Indexes And Validate       Zeek    Suricata

