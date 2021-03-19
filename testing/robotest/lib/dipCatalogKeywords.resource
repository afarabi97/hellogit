*** Settings ***
Resource    ../include/dipCommonVariables.resource
Resource    ../include/dipCatalogVariables.resource

Library     SeleniumLibrary     30s    run_on_failure=NONE
Library     String

*** Keywords ***
Download App From Catalog
    [Arguments]  ${application_name}  ${config_app_button}
    Click Element    ${locCatalogPageNavIcon}
    Wait Until Page Contains    CVAH CATALOG
    Wait Until Page Contains    ${application_name}
    Click Button    ${config_app_button}
    Wait Until Page Contains Element    ${locSelectProcessDropdown}
    Click Element   ${locSelectProcessDropdown}
    Click Element   ${locInstallButton}
    ${next_btn_list} =   Get WebElements  id=app-catalog-page-div-mat-card-div-button-next-get-config
    ${first_3_chars} =  String.Get Substring  ${PIPELINE}  0  3
    Run Keyword if  '${application_name}' == 'Moloch' or '${application_name}' == 'Suricata' or '${application_name}' == 'Zeek'
    ...  Run Keywords  Click Element  ${locNodeSelection}
    ...  AND  Wait Until Page Contains Element  ${locFirstNodeOption}
    ...  AND  Click Element  ${locFirstNodeOption}
    ...  AND  Press Keys  None  TAB
    ...  AND  Click Button  ${next_btn_list[0]}  # Next btn
    ...  AND  Run Keyword if  '${application_name}' == 'Moloch' and '${first_3_chars}' != 'hw-'
    ...                        Input Text  ${locMemLimitInput}  6Gi  # If virtual kit decrease memory limit from 20Gi to 6Gi
    ...  AND  Click Element  ${locInterfaceSelection}
    ...  AND  Click Element  ${locFirstInterfaceOption}
    ...  AND  Press Keys  None  TAB
    ...  AND  Click Button  ${next_btn_list[1]}  # Next btn
    ...  AND  Wait Until Page Contains    Enable Edit
    ...  AND  Click Button    ${next_btn_list[2]}  # Run btn
    ...  ELSE
    ...  Run Keywords  Click Button    ${next_btn_list[0]}  # Next btn
    ...  AND  Wait Until Page Contains    server
    ...  AND  Click Button    ${next_btn_list[1]}  # Next btn
    ...  AND  Wait Until Page Contains    Enable Edit
    ...  AND  Click Button    ${next_btn_list[2]}  # Run btn
    Sleep  15s

Verify App Has Been Installed
    [Arguments]  ${application_name}  ${application_card}  ${app_card_circle}
    # Visual confirmation on the Catalog Page that the app is installed
    Click Element    ${locCatalogPageNavIcon}
    Wait Until Page Contains    CVAH CATALOG
    Wait Until Page Contains Element    ${application_card}
    Wait Until Element Contains    ${application_card}  DEPLOYED  10m
    Element Attribute Value Should Be    ${app_card_circle}  style  background-color: green;
    # Check Notifications to see if app has been installed on controller
    Click Element    ${locNotificationsNavIcon}
    Wait Until Element Contains    ${locNotificationsPopup}  COMPLETED Installing ${application_name}  10m
    Press Keys  None  ESCAPE
    Sleep  10s
    # Visual confirmation on the Health Page that the app is installed
    Click Element   ${locHealthPageNavIcon}
    Wait Until Page Contains    sensor1
    Wait Until Page Contains    server1
    Wait Until Page Does Not Contain    Pod Errors  5m
    ${app_name_lowercase} =  Convert To Lower Case  ${application_name}
    ${expectedText} =  Set Variable If
    ...  '${app_name_lowercase}' == 'moloch' or '${app_name_lowercase}' == 'zeek'
    ...  -sensor1-${app_name_lowercase}    ${app_name_lowercase}: running  # else var assigned "${app_name_lowercase}: running"
    ${app_on_health_page} =  Set Variable  False
    ${pod_status_tables} =  Get WebElements  xpath=//*[contains(@id, "mat-tab-label-")]
    ${num_tables} =  Get Length  ${pod_status_tables}
    FOR    ${index}    IN RANGE    ${num_tables}
        Click Element    ${pod_status_tables[${index}]}
        ${app_on_health_page} =  Run Keyword And Return Status  Page Should Contain  ${expectedText}
        Run Keyword If	'${app_on_health_page}' == 'True'	Exit For Loop
    END
    Run Keyword if  '${app_on_health_page}'=='False'    Fail    ${application_name} not listed on Health page

Uninstall App
    [Arguments]  ${application_name}  ${application_card}  ${config_app_button}
    Click Element    ${locCatalogPageNavIcon}
    Wait Until Page Contains    ${application_name}
    Wait Until Page Contains Element    ${config_app_button}
    Click Button    ${config_app_button}
    Wait Until Page Contains Element    ${locSelectProcessDropdown}
    Click Element   ${locSelectProcessDropdown}
    ${process_select_options} =  Get WebElements  xpath=//*[contains(@id, "-form-field-process-mat-select-mat-option-")]
    ${uninstall_button} =  Set Variable  ${process_select_options[-1]}  # Uninstall btn should be last index position of options list
    Click Element  ${uninstall_button}
    Run Keyword if  '${application_name}' == 'Moloch' or '${application_name}' == 'Suricata' or '${application_name}' == 'Zeek'
    ...  Run Keywords  Click Element  ${locNodeSelection}
    ...  AND  Click Element  ${locFirstNodeOption}
    ...  AND  Press Keys  None  TAB
    Click Button    ${locRunButton}
    Wait Until Element Does Not Contain    ${application_card}  DEPLOYED  10m
    Sleep  15s