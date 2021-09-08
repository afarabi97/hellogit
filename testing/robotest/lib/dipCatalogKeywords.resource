*** Settings ***
Resource    ../include/dipCommonVariables.resource
Resource    ../include/dipCatalogVariables.resource


*** Keywords ***
Install Apps
    [Arguments]    &{APPS_TO_INSTALL_DICT}
    [Documentation]  Installs the given list of apps from Catalog page and verifies successful install by checking each apps card & notifications
    Set Selenium Speed  0.5s
    FOR    ${key}    ${value}    IN    &{APPS_TO_INSTALL_DICT}
        Download App From Catalog    ${key}    ${value.config_btn}
        Verify App Has Been Installed  ${key}  ${value.app_card}  ${value.app_card_circle}
    END

Uninstall Apps
    [Arguments]    &{APPS_TO_UNINSTALL_DICT}
    [Documentation]  Uninstalls the given list of apps from Catalog page and verifies successful install by checking the app card, notifications
    Set Selenium Speed  0.5s
    FOR    ${key}    ${value}    IN    &{APPS_TO_UNINSTALL_DICT}
        Uninstall App  ${key}    ${value.app_card}  ${value.config_btn}
    END

# Install/Uninstall Every App
    # [Documentation]  Installs apps from Catalog page and verifies successful install by checking the app card, notifications
    # ...              and the Health page. The app is then immediately uninstalled.
    # Set Selenium Speed  0.5s
    # Download App From Catalog  Arkime-viewer  ${locArkimeViewerConfigAppBtn}
    # Verify App Has Been Installed  Arkime-viewer  ${locArkimeViewerAppCard}  ${locArkimeViewerAppCardCircle}
    # Download App From Catalog  Arkime  ${locArkimeConfigAppBtn}
    # Verify App Has Been Installed  Arkime  ${locArkimeAppCard}  ${locArkimeAppCardCircle}
    # Uninstall App  Arkime  ${locArkimeAppCard}  ${locArkimeConfigAppBtn}
    # Uninstall App  Arkime-viewer  ${locArkimeViewerAppCard}  ${locArkimeViewerConfigAppBtn}

    # Download App From Catalog  Cortex  ${locCortexConfigAppBtn}
    # Verify App Has Been Installed  Cortex  ${locCortexAppCard}  ${locCortexAppCardCircle}
    # Uninstall App  Cortex  ${locCortexAppCard}  ${locCortexConfigAppBtn}

    # # Download App From Catalog  Hive  ${locHiveConfigAppBtn}
    # # Verify App Has Been Installed  Hive  ${locHiveAppCard}  ${locHiveAppCardCircle}
    # # Uninstall App  Hive  ${locHiveAppCard}  ${locHiveConfigAppBtn}

    # Download App From Catalog  Logstash  ${locLogstashConfigAppBtn}
    # Verify App Has Been Installed  Logstash  ${locLogstashAppCard}  ${locLogstashAppCardCircle}
    # Uninstall App  Logstash  ${locLogstashAppCard}  ${locLogstashConfigAppBtn}

    # Download App From Catalog  Misp  ${locMispConfigAppBtn}
    # Verify App Has Been Installed  Misp  ${locMispAppCard}  ${locMispAppCardCircle}
    # Uninstall App  Misp  ${locMispAppCard}  ${locMispConfigAppBtn}

    # Download App From Catalog  Rocketchat  ${locRocketchatConfigAppBtn}
    # Verify App Has Been Installed  Rocketchat  ${locRocketchatAppCard}  ${locRocketchatAppCardCircle}
    # Uninstall App  Rocketchat  ${locRocketchatAppCard}  ${locRocketchatConfigAppBtn}

    # Download App From Catalog  Suricata  ${locSuricataConfigAppBtn}
    # Verify App Has Been Installed  Suricata  ${locSuricataAppCard}  ${locSuricataAppCardCircle}
    # Uninstall App  Suricata  ${locSuricataAppCard}  ${locSuricataConfigAppBtn}

    # Download App From Catalog  Wikijs  ${locWikijsConfigAppBtn}
    # Verify App Has Been Installed  Wikijs  ${locWikijsAppCard}  ${locWikijsAppCardCircle}
    # Uninstall App  Wikijs  ${locWikijsAppCard}  ${locWikijsConfigAppBtn}

    # Download App From Catalog  Zeek  ${locZeekConfigAppBtn}
    # Verify App Has Been Installed  Zeek  ${locZeekAppCard}  ${locZeekAppCardCircle}
    # Uninstall App  Zeek  ${locZeekAppCard}  ${locZeekConfigAppBtn}

Download App From Catalog
    [Arguments]  ${application_name}  ${config_app_button}
    [Documentation]  Downloads specified app from Catalog page
    Wait Until Element Is Visible    ${locCatalogPageNavIcon}
    Click Element    ${locCatalogPageNavIcon}
    Wait Until Page Contains    CVAH CATALOG
    Wait Until Page Contains    ${application_name}
    Click Button    ${config_app_button}
    Wait Until Page Contains Element    ${locSelectProcessDropdown}
    Click Element   ${locSelectProcessDropdown}
    Click Element   ${locInstallButton}
    ${next_btn_list} =   Get WebElements  id=app-catalog-page-div-mat-card-div-button-next-get-config
    Run Keyword if  '${application_name}' == 'Arkime' or '${application_name}' == 'Suricata' or '${application_name}' == 'Zeek'
    ...  Run Keywords  Click Element  ${locNodeSelection}
    ...  AND  Wait Until Page Contains Element  ${locFirstNodeOption}
    ...  AND  Click Element  ${locFirstNodeOption}
    ...  AND  Press Keys  None  TAB
    ...  AND  Click Button  ${next_btn_list[0]}  # Next btn
    ...  AND  Run Keyword if  '${application_name}' == 'Arkime' and ${IS_BARE_METAL_KIT} is ${False}
    ...                        Input Text  ${locMemLimitInput}  6Gi  # If virtual kit decrease memory limit from 20Gi to 6Gi
    ...  AND  SeleniumLibrary.Capture Page Screenshot    filename=Arkime-screenshot-{index}.png
    ...  AND  Click Element  ${locInterfaceSelection}
    ...  AND  Click Element  ${locFirstInterfaceOption}
    ...  AND  Press Keys  None  TAB
    ...  AND  Wait Until Element Is Enabled  ${next_btn_list[1]}  # Next btn
    ...  AND  Click Button  ${next_btn_list[1]}  # Next btn
    ...  AND  Wait Until Page Contains    Enable Edit
    ...  AND  Click Button    ${next_btn_list[2]}  # Run btn
    ...  ELSE
    ...  Run Keywords  Click Button    ${next_btn_list[0]}  # Next btn
    ...  AND  Run Keyword if  '${application_name}' == 'Logstash' and ${IS_BARE_METAL_KIT} is ${False}
    ...                        Input Text  ${locHeapSizeInput}  4  # If virtual kit decrease heap_size from 12 to 4
    ...  AND  Wait Until Page Contains    server
    ...  AND  Wait Until Element Is Enabled  ${next_btn_list[1]}  # Next btn
    ...  AND  Click Button    ${next_btn_list[1]}  # Next btn
    ...  AND  Wait Until Page Contains    Enable Edit
    ...  AND  Click Button    ${next_btn_list[2]}  # Run btn
    Sleep  15s

Verify App Has Been Installed
    [Arguments]  ${application_name}  ${application_card}  ${app_card_circle}
    [Documentation]  Checks if specified app was sucessfully installed on kit
    Check App Card Status  ${application_card}  ${app_card_circle}
    Check Notifications For App  ${application_name}
    Check Health Page For App  ${application_name}

Check App Card Status
    [Arguments]  ${application_card}  ${app_card_circle}
    [Documentation]  Visual confirmation on the Catalog Page that the app is installed
    Wait Until Element Is Visible    ${locCatalogPageNavIcon}
    Click Element    ${locCatalogPageNavIcon}
    Wait Until Page Contains    CVAH CATALOG
    Wait Until Page Contains Element    ${application_card}
    Wait Until Element Contains    ${application_card}  DEPLOYED  10m
    Element Attribute Value Should Be    ${app_card_circle}  style  background-color: green;

Check Notifications For App
    [Arguments]  ${application_name}
    [Documentation]  Check Notifications to see if app has been installed on controller
    Click Element    ${locNotificationsNavIcon}
    Wait Until Element Contains    ${locNotificationsPopup}  COMPLETED Installing ${application_name}  10m
    Press Keys  None  ESCAPE
    Sleep  10s

Check Health Page For App
    [Arguments]  ${application_name}
    [Documentation]  Visual confirmation on the Health Page that the app is installed
    Click Element   ${locHealthPageNavIcon}
    Wait Until Page Does Not Contain  Pod Errors  5m
    ${app_name_lower} =  Convert To Lower Case  ${application_name}
    ${expectedText} =  Set Variable If
    ...  '${app_name_lower}' == 'arkime'  -${app_name_lower}-  ${app_name_lower}  # else var just assigned app name
    ${app_on_health_page} =  Set Variable  False

    Run Keyword If  '${KIT_VERSION}' == '3.6'
    ...  Wait Until Page Contains  Pod Health
    ...  ELSE IF  '${KIT_VERSION}' == '3.7'
    ...  Wait Until Page Contains  Pods

    ${pod_table_loc} =  Set Variable If
    ...  '${KIT_VERSION}' == '3.6'
    ...  xpath=//*[contains(@id, "mat-tab-label-")]
    ...  '${KIT_VERSION}' == '3.7'
    ...  xpath=//*[@id="app-root-app-top-navbar"]/mat-drawer-container/mat-drawer-content/div/app-health-dashboard/div/app-health-dashboard-pod-table/mat-card/mat-card-content/table/tbody/tr/td[1]/span[1]

    ${pod_status_tables} =  Get WebElements  ${pod_table_loc}
    FOR  ${table}  IN  @{pod_status_tables}
        Click Element  ${table}
        Sleep  1s
        ${app_on_health_page} =  Run Keyword And Return Status  Page Should Contain  ${expectedText}
        Run Keyword If	'${app_on_health_page}' == 'True'  Exit For Loop
    END
    Run Keyword if  '${app_on_health_page}'=='False'  Fail  ${application_name} not listed on Health page

Uninstall App
    [Arguments]  ${application_name}  ${application_card}  ${config_app_button}
    [Documentation]  Uninstalls specified app via the Catalog page
    Click Element    ${locCatalogPageNavIcon}
    Wait Until Page Contains    ${application_name}
    Wait Until Page Contains Element    ${config_app_button}
    Click Button    ${config_app_button}
    Run Keyword If  '${application_name}' == 'Arkime'
    ...  Run Keywords    Run Keyword And Ignore Error    Wait Until Page Contains Element    ${locArkimeIsDependent}    timeout=2s
    ...  AND     Run Keyword And Ignore Error    Click Element    ${locArkimeIsDependentContinueBtn}
    Wait Until Page Contains Element    ${locSelectProcessDropdown}
    Click Element   ${locSelectProcessDropdown}
    ${process_select_options} =  Get WebElements  xpath=//*[contains(@id, "-form-field-process-mat-select-mat-option-")]
    ${uninstall_button} =  Set Variable  ${process_select_options[-1]}  # Uninstall btn should be last index position of options list
    Click Element  ${uninstall_button}
    Run Keyword if  '${application_name}' == 'Arkime' or '${application_name}' == 'Suricata' or '${application_name}' == 'Zeek'
    ...  Run Keywords  Click Element  ${locNodeSelection}
    ...  AND  Click Element  ${locFirstNodeOption}
    ...  AND  Press Keys  None  TAB
    Click Button    ${locRunButton}
    Wait Until Element Does Not Contain    ${application_card}  DEPLOYED  10m
    Sleep  15s
