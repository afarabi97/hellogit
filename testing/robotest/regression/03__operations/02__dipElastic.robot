*** Settings ***
Resource    ../../lib/dipCatalogKeywords.resource
Resource    ../../lib/dipCommonKeywords.resource
Resource    ../../lib/dipElasticKeywords.resource
Resource    ../../lib/dipRulesetKeywords.resource
Resource    ../../lib/dipTestPcapFilesKeywords.resource
Resource    ../../lib/dipToolsKeywords.resource


Suite Setup       Open SSH Connection      ${HOST}                ${HOST_USERNAME}                ${HOST_PASSWORD}
Test Setup        Run Keywords             Runner Open Browser    ${HOST}                         ${BROWSER}
                  ...                      AND                    Set DIP Kit Global Variables
                  ...                      AND                    Log Into DIP Controller  ${SSO_ADMIN_USERNAME}    ${NEW_SSO_ADMIN_PASSWORD}
Test Teardown     Run Keywords             Log Out Of Controller  AND  Close All Browsers
Suite Teardown    Close All Connections

*** Test Cases ***
Run Elastic Integration Test
    [Tags]  THISISCVAH-10191
    [Documentation]  Grab the elastic password and run some tests
    Set Selenium Speed  1s
    Install Multiple Apps  Logstash   Zeek    Suricata    Arkime-viewer    Arkime
    Log In To Kibana
    Navigate To Test PCAP Files
    Replay PCAP  pcap=wannacry.pcap
    Wait And Validate Kibana Hits
    Navigate To Portal

Run Index Management Test
    [Tags]                           THISISCVAH-12853
    [Documentation]                  Run Index Management Tests
    Set Selenium Speed               0.5s
    Install Multiple Apps            Zeek    Suricata
    Close Indexes And Validate       Zeek    Suricata

Check MinIO (Elastic) Backup Capability
    [Tags]  THISISCVAH-12832
    [Documentation]  Tests the "Backup and close" option on the Index Management page
    Set Selenium Speed  0.5s
    Navigate To Index Management
    Backup And Close Indexes

Check Elastic License Information
    [Tags]  THISISCVAH-14404
    [Documentation]  Gets the data of the elastic license from backend API and compares
    ...              the returned data to what is displayed on the controller UI.
    Navigate To Tools
    ${elastic_info_dict} =  Get Elastic License Status  # API call
    Compare License Backend Data To UI  ${elastic_info_dict}

Update Elastic License
    [Tags]  THISISCVAH-13576
    [Documentation]  The purpose of this test is to ensure that the elastic license
    ...              can be updated with the newest license available.
    Navigate To Tools
    ${curr_exp_date} =  Get Elastic License Expiration
    log  Current Elastic license expiration date is: ${curr_exp_date}
    ${uploaded} =  Run Keyword And Return Status
    ...            Upload Elastic License  file_name=elastic_license_exp_11_29_2023_robot.json
    IF  ${uploaded}  # Verify New Expiration Date
        reload
        ${new_exp_date} =  Get Elastic License Expiration
        ${time_diff} =  Subtract Date From Date  ${new_exp_date}  ${curr_exp_date}
        IF  ${time_diff} == 0
            log  Elastic license with same expiration date has been uploaded.
        ELSE
            log  Updated Elastic license expiration date is now: ${new_exp_date}
        END
    END
