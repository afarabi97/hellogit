*** Settings ***
Resource    ../include/dipCommonVariables.resource
Resource    ../include/dipCatalogVariables.resource


*** Keywords ***
Install/Uninstall Every App
    [Documentation]  Installs apps from Catalog page and verifies successful install by checking the app card, notifications
    ...              and the Health page. The app is then immediately uninstalled.
    Set Selenium Speed  0.5s
    Wait Until Element Is Visible  ${locCatalogPageNavIcon}
    Click Element  ${locCatalogPageNavIcon}
    Wait Until Page Contains  Catalog

    ${skip_apps} =  Create List  Arkime-viewer  Remote-health-agent
    Wait Until Element Is Visible  xpath=//*[contains(@id, "-app-card-div-div-div-h3-chart-application")]
    ${app_name_count} =  Get Element Count  xpath=//*[contains(@id, "-app-card-div-div-div-h3-chart-application")]
    FOR  ${index}  IN RANGE  ${app_name_count}
        ${app_name} =  Get Text  id=app-chart-list-${index}-app-card-div-div-div-h3-chart-application
        Run Keyword If  '${app_name}' == 'Arkime'
        ...  Run Keywords  Install App  Arkime-viewer
        ...  AND  Install App  ${app_name}
        ...  AND  Uninstall App  ${app_name}
        ...  AND  Uninstall App  Arkime-viewer
        ...  ELSE IF  $app_name not in $skip_apps
        ...  Run Keywords  Install App  ${app_name}
        ...  AND  Uninstall App  ${app_name}
    END

Install Multiple Apps
    [Arguments]  @{application_list}
    [Documentation]  Installs one or many apps from Catalog page.
    Set Selenium Speed  0.5s
    log     Installing the following applications:
    FOR  ${appname}  IN  @{application_list}
        log     \t- ${appname}
    END
    FOR  ${application}  IN  @{application_list}
        Install App  ${application}
    END

Uninstall Multiple Apps
    [Arguments]  @{application_list}
    [Documentation]  Uninstalls one or many apps from Catalog page.
    Set Selenium Speed  0.5s
    FOR  ${application}  IN  @{application_list}
        Uninstall App  ${application}
    END

Install App
    [Arguments]  ${application_name}
    [Documentation]  Downloads specified app from Catalog page
    log     Installing App: ${application_name}
    Wait Until Element Is Visible  ${locCatalogPageNavIcon}
    click  ${locCatalogPageNavIcon}
    lookFor  ${application_name}
    ${index} =  Find App index  ${application_name}

    ${app_card_status} =  Set Variable  xpath=//*[@id="app-chart-list-div-app-card-${index}"]/div/div[2]/div[1]/div[2]
    lookForElement  ${app_card_status}
    ${app_status_text} =  Get Text  ${app_card_status}
    ${app_status_text} =  Fetch From Right  ${app_status_text}  :
    ${app_status_text} =  Strip String  ${app_status_text}
    IF  '${app_status_text}' == 'DEPLOYED'
        log     ${application_name} has already been deployed
        Return From Keyword
    END
    # Return From Keyword If  '${app_status_text}' == 'DEPLOYED'  # App is already installed

    ${config_app_button} =  Set Variable  id=app-chart-list-${index}-app-card-div-div-div-button-configure-application
    lookForElement  ${config_app_button}
    Click Button  ${config_app_button}
    lookForElement  ${locSelectProcessDropdown}
    click  ${locSelectProcessDropdown}
    Wait Until Element Is Visible  ${locInstallButton}
    click  ${locInstallButton}
    Wait Until Element Contains  ${locSelectProcessDropdown}  Install
    ${next_btn_list} =   Get WebElements  id=app-catalog-page-div-mat-card-div-button-next-get-config
    Run Keyword if  '${application_name}' == 'Arkime' or '${application_name}' == 'Suricata' or '${application_name}' == 'Zeek'
    ...  Run Keywords  click  ${locNodeSelection}
    ...  AND  lookForElement  ${locFirstNodeOption}
    ...  AND  click  ${locFirstNodeOption}
    ...  AND  Press Keys  None  TAB
    ...  AND  Wait Until Element Is Enabled  ${next_btn_list[0]}
    ...  AND  Click Button  ${next_btn_list[0]}  # Next btn
    ...  AND  Run Keyword if  '${application_name}' == 'Arkime' and ${IS_BARE_METAL_KIT} is ${False}
    ...                        type  ${locMemLimitInput}  6Gi  # If virtual kit decrease memory limit from 20Gi to 6Gi
    ...  AND  click  ${locInterfaceSelection}
    ...  AND  click  ${locFirstInterfaceOption}
    ...  AND  Press Keys  None  TAB
    ...  AND  Wait Until Element Is Enabled  ${next_btn_list[1]}
    ...  AND  Click Button  ${next_btn_list[1]}  # Next btn
    ...  AND  lookFor  Enable Edit
    ...  AND  Click Button  ${next_btn_list[2]}  # Run btn
    ...  ELSE
    ...  Run Keywords  Wait Until Element Is Enabled  ${next_btn_list[0]}
    ...  AND  Click Button  ${next_btn_list[0]}  # Next btn
    ...  AND  Run Keyword if  '${application_name}' == 'Logstash' and ${IS_BARE_METAL_KIT} is ${False}
    ...                        type  ${locHeapSizeInput}  4  # If virtual kit decrease heap_size from 12 to 4
    ...  AND  lookFor  server
    ...  AND  Wait Until Element Is Enabled  ${next_btn_list[1]}
    ...  AND  Click Button  ${next_btn_list[1]}  # Next btn
    ...  AND  lookFor  Enable Edit
    ...  AND  Click Button  ${next_btn_list[2]}  # Run btn
    Sleep  10s
    Verify App Has Been Installed  ${application_name}  ${index}

Verify App Has Been Installed
    [Arguments]  ${application_name}  ${index}
    [Documentation]  Checks if specified app was sucessfully installed on kit
    Wait Until Keyword Succeeds  5x  5s  Check App Card Status  ${index}  DEPLOYED
    Check Notifications For App  ${application_name}
    Check Health Page For App  ${application_name}

Check App Card Status
    [Arguments]  ${index}  ${expected_status}
    [Documentation]  Visual confirmation on the Catalog Page that the app is installed
    Wait Until Element Is Visible  ${locCatalogPageNavIcon}
    Click Element  ${locCatalogPageNavIcon}
    Wait Until Page Contains  Catalog
    Reload Page
    ${application_card} =  Set Variable  id=app-chart-list-div-app-card-${index}
    lookForElement  ${application_card}
    Wait Until Element Contains  ${application_card}  ${expected_status}  2m
    ${app_card_circle} =  Set Variable  id=app-chart-list-${index}-app-card-div-div-div-button
    ${circle_color} =  Set Variable If  '${expected_status}' == 'DEPLOYED'  rgb(30, 185, 128)
    ...  '${expected_status}' == 'Not Installed'  white
    Element Attribute Value Should Be  ${app_card_circle}  style  background-color: ${circle_color};

Check Notifications For App
    [Arguments]  ${application_name}
    [Documentation]  Check Notifications to see if app has been installed on controller
    click  ${locNotificationsNavIcon}
    Wait Until Element Contains  ${locTopNotification}  COMPLETED Installing ${application_name}  10m
    Press Keys  None  ESCAPE
    Sleep  5s

Check Health Page For App
    [Arguments]  ${application_name}
    [Documentation]  Visual confirmation on the Health Page that the app is installed
    click  ${locHealthPageNavIcon}
    Wait Until Page Does Not Contain  Pod Errors  5m
    ${app_name_lower} =  Convert To Lower Case  ${application_name}
    ${expected_text} =  Set Variable If
    ...  '${app_name_lower}' == 'arkime'  -${app_name_lower}-  ${app_name_lower}  # else var just assigned app name
    ${app_on_health_page} =  Set Variable  False

    Run Keyword If  '${KIT_VERSION}' == '3.6'
    ...  lookFor  Pod Health
    ...  ELSE IF  '${KIT_VERSION}' == '3.7'
    ...  lookFor  Pods

    ${pod_table_loc} =  Set Variable If
    ...  '${KIT_VERSION}' == '3.6'
    ...  xpath=//*[contains(@id, "mat-tab-label-")]
    ...  '${KIT_VERSION}' == '3.7'
    ...  xpath=//*[@id="app-root-app-top-navbar"]/mat-drawer-container/mat-drawer-content/div/app-health-dashboard/div/app-health-dashboard-pod-table/mat-card/mat-card-content/table/tbody/tr/td[1]/span[1]

    Wait Until Element Is Visible  ${pod_table_loc}
    ${pod_status_tables} =  Get WebElements  ${pod_table_loc}
    FOR  ${table}  IN  @{pod_status_tables}
        click  ${table}
        Sleep  1s
        ${app_on_health_page} =  Run Keyword And Return Status  Page Should Contain  ${expected_text}
        Run Keyword If	'${app_on_health_page}' == 'True'  Exit For Loop
    END
    Run Keyword if  '${app_on_health_page}'=='False'  Fail  ${application_name} not listed on Health page

Uninstall App
    [Arguments]  ${application_name}
    [Documentation]  Uninstalls specified app via the Catalog page
    click  ${locCatalogPageNavIcon}
    lookFor  ${application_name}
    ${index} =  Find App index  ${application_name}

    ${app_card_status} =  Set Variable  xpath=//*[@id="app-chart-list-div-app-card-${index}"]/div/div[2]/div[1]/div[2]
    lookForElement  ${app_card_status}
    ${app_status_text} =  Get Text  ${app_card_status}
    ${app_status_text} =  Fetch From Right  ${app_status_text}  :
    ${app_status_text} =  Strip String  ${app_status_text}
    Return From Keyword If  '${app_status_text}' == 'Not Installed'  # App does not need to be uninstalled

    ${config_app_button} =  Set Variable  id=app-chart-list-${index}-app-card-div-div-div-button-configure-application
    lookForElement  ${config_app_button}
    Click Button  ${config_app_button}
    Run Keyword If  '${application_name}' == 'Arkime'
    ...  Run Keywords    Run Keyword And Ignore Error    lookForElement    ${locArkimeIsDependent}    timeout=2s
    ...  AND     Run Keyword And Ignore Error    click    ${locArkimeIsDependentContBtn}
    lookForElement  ${locSelectProcessDropdown}
    click  ${locSelectProcessDropdown}
    ${process_select_options} =  Get WebElements  xpath=//*[contains(@id, "-form-field-process-mat-select-mat-option-")]
    ${uninstall_button} =  Set Variable  ${process_select_options[-1]}  # Uninstall btn should be last index position of options list
    click  ${uninstall_button}
    Run Keyword if  '${application_name}' == 'Arkime' or '${application_name}' == 'Suricata' or '${application_name}' == 'Zeek'
    ...  Run Keywords  click  ${locNodeSelection}
    ...  AND  click  ${locFirstNodeOption}
    ...  AND  Press Keys  None  TAB
    Click Button  ${locCatalogRunBtn}
    ${application_card} =  Set Variable  id=app-chart-list-div-app-card-${index}
    Wait Until Keyword Succeeds  5x  5s  Check App Card Status  ${index}  Not Installed
    click  ${locNotificationsNavIcon}
    Wait Until Element Contains  ${locTopNotification}  COMPLETED Deleting ${application_name}  10m
    Press Keys  None  ESCAPE
    Sleep  10s

Clean Up Catalog Page
    [Documentation]  Uninstalls all apps that have been installed on the Catalog page.
    Runner Open Browser  ${HOST}  ${BROWSER}
    Login Into DIP Controller    ${SSO_ADMIN_USERNAME}  ${NEW_SSO_ADMIN_PASSWORD}
    lookFor    Portal
    Wait Until Element Is Visible  ${locCatalogPageNavIcon}
    Click Element  ${locCatalogPageNavIcon}
    Wait Until Page Contains  Catalog
    Set Selenium Speed  0.5s

    Wait Until Element Is Visible  xpath=//*[contains(@id, "-app-card-div-div-div-h3-chart-application")]
    ${app_name_count} =  Get Element Count  xpath=//*[contains(@id, "-app-card-div-div-div-h3-chart-application")]
    FOR  ${index}  IN RANGE  ${app_name_count}
        ${app_name} =  Get Text  id=app-chart-list-${index}-app-card-div-div-div-h3-chart-application
        Uninstall App  ${app_name}
    END
    Close Browser

Find App index
    [Arguments]  ${application_name}
    [Documentation]  Locates and returns index of application based on name supplied in argument.
    Wait Until Element Is Visible  xpath=//*[contains(@id, "-app-card-div-div-div-h3-chart-application")]
    ${app_name_elements} =  Get WebElements  xpath=//*[contains(@id, "-app-card-div-div-div-h3-chart-application")]
    ${index} =  Set Variable  ${0}
    FOR  ${element}  IN  @{app_name_elements}
        ${app_name} =  Get Text  ${element}
        Return From Keyword If  '${app_name}' == '${application_name}'  ${index}
        ${index} =  Set Variable  ${index + 1}
    END
    Return From Keyword  ${-1}
