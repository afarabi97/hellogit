*** Settings ***
Resource    ../include_regression/dipCommonVariables.resource
Resource    ../include_regression/dipCatalogVariables.resource
Library     SeleniumLibrary    30s    run_on_failure=NONE

*** Keywords ***
Install/Uninstall Every App
    [Documentation]  Installs apps from Catalog page and verifies successful install by checking the app card, notifications
    ...              and the Health page. The app is then immediately uninstalled.
    Clear Preexisting Notifications  ${locCatalogNotificationTypeBtn}
    Wait Until Element Is Visible  ${locCatalogPageNavIcon}
    Click Element  ${locCatalogPageNavIcon}
    ${skip_apps} =  Create List  Arkime-viewer  Remote-health-agent  Hive  Misp
    Wait Until Element Is Visible  xpath=//*[contains(@id, "-app-card-div-div-div-h3-chart-application")]
    ${app_name_count} =  Get Element Count  xpath=//*[contains(@id, "-app-card-div-div-div-h3-chart-application")]
    FOR  ${index}  IN RANGE  ${app_name_count}
        ${app_name} =  Get Text  id=app-chart-list-${index}-app-card-div-div-div-h3-chart-application
        IF  '${app_name}' == 'Arkime'
            Install App  Arkime-viewer
            Install App  ${app_name}
            Uninstall App  ${app_name}
            Uninstall App  Arkime-viewer
        ELSE IF  '${app_name}' == 'Cortex'
            Install App  ${app_name}
            Install App  Misp
            Install App  Hive
            Uninstall App  Hive
            Uninstall App  Misp
            Uninstall App  ${app_name}
        ELSE IF  $app_name not in $skip_apps
            Install App  ${app_name}
            Uninstall App  ${app_name}
        END
    END

Install Multiple Apps
    [Arguments]  @{application_list}
    [Documentation]  Installs one or many apps from Catalog page.
    Clear Preexisting Notifications  ${locCatalogNotificationTypeBtn}
    FOR  ${application}  IN  @{application_list}
        Install App  ${application}
    END

Uninstall Multiple Apps
    [Arguments]  @{application_list}
    [Documentation]  Uninstalls one or many apps from Catalog page.
    Clear Preexisting Notifications  ${locCatalogNotificationTypeBtn}
    FOR  ${application}  IN  @{application_list}
        Uninstall App  ${application}
    END

Install App
    [Arguments]  ${application_name}
    [Documentation]  Downloads specified app from Catalog page
    Wait Until Element Is Visible  ${locCatalogPageNavIcon}
    Click Element  ${locCatalogPageNavIcon}
    Wait Until Page Contains  ${application_name}
    ${index} =  Find App index  ${application_name}
    ${app_status_text} =  Get App Status Text  ${index}
    Return From Keyword If  '${app_status_text}' == 'DEPLOYED'  # App is already installed

    Log To Console  Installing app: ${application_name}
    ${config_app_button} =  Set Variable  id=app-chart-list-${index}-app-card-div-div-div-button-configure-application
    Wait Until Page Contains Element  ${config_app_button}
    Click Button  ${config_app_button}
    Wait Until Page Contains Element  ${locSelectProcessDropdown}
    Click Element  ${locSelectProcessDropdown}
    Wait Until Element Is Visible  ${locInstallButton}
    Click Element  ${locInstallButton}
    Wait Until Element Contains  ${locSelectProcessDropdown}  Install
    Sleep  1s  reason=Prevent Selenium from clicking Node Selection dropdown too quickly
    ${next_btn_list} =   Get WebElements  id=app-catalog-page-div-mat-card-div-button-next-get-config
    IF  '${application_name}' == 'Arkime' or '${application_name}' == 'Suricata' or '${application_name}' == 'Zeek'
        Wait Until Element Is Enabled  ${locNodeSelection}
        Click Element  ${locNodeSelection}
        Wait Until Page Contains Element  ${locFirstNodeOption}
        Click Element  ${locFirstNodeOption}
        SeleniumLibrary.Press Keys  None  ESCAPE
        Wait Until Element Is Enabled  ${next_btn_list[0]}
        Click Button  ${next_btn_list[0]}  # Next btn
        Sleep  2s  reason=Page animation
        Run Keyword if  '${application_name}' == 'Arkime' and ${IS_BARE_METAL_KIT} is ${False}
        ...             Input Text  ${locMemLimitInput}  6Gi  # If virtual kit decrease memory limit from 20Gi to 6Gi
        Wait Until Element Is Visible  ${locInterfaceSelection}
        Click Element  ${locInterfaceSelection}
        Wait Until Element Is Visible  ${locFirstInterfaceOption}
        Click Element  ${locFirstInterfaceOption}
        SeleniumLibrary.Press Keys  None  ESCAPE
    ELSE
        Wait Until Element Is Enabled  ${next_btn_list[0]}
        Click Button  ${next_btn_list[0]}  # Next btn
        Run Keyword if  '${application_name}' == 'Logstash'
        ...             Input Text  ${locHeapSizeInput}  4
        Wait Until Page Contains  server
    END
    Wait Until Element Is Enabled  ${next_btn_list[1]}
    Click Button  ${next_btn_list[1]}  # Next btn
    Wait Until Page Contains  Enable Edit
    Click Button  ${next_btn_list[2]}  # Run btn
    Sleep  10s
    Verify App Has Been Installed  ${application_name}  ${index}

Verify App Has Been Installed
    [Arguments]  ${application_name}  ${index}
    [Documentation]  Checks if specified app was sucessfully installed on kit
    Wait Until Keyword Succeeds  3x  5s  Check App Card Status  ${index}  DEPLOYED
    Check Notifications Panel  DEPLOYED Installing ${application_name}  5m
    Check Health Page For App  ${application_name}

Check App Card Status
    [Arguments]  ${index}  ${expected_status}
    [Documentation]  Visual confirmation on the Catalog Page that the app is installed
    Wait Until Element Is Visible  ${locCatalogPageNavIcon}
    Click Element  ${locCatalogPageNavIcon}
    Reload Page
    ${application_card} =  Set Variable  id=app-chart-list-div-app-card-${index}
    Wait Until Page Contains Element  ${application_card}
    Wait Until Element Contains  ${application_card}  ${expected_status}  5m
    ${app_card_circle} =  Set Variable  id=app-chart-list-${index}-app-card-div-div-div-button
    ${circle_color} =  Set Variable If  '${expected_status}' == 'DEPLOYED'  rgb(30, 185, 128)
    ...  '${expected_status}' == 'Not Installed'  white
    Element Attribute Value Should Be  ${app_card_circle}  style  background-color: ${circle_color};

Check Health Page For App
    [Arguments]  ${application_name}
    [Documentation]  Visual confirmation on the Health Page that the app is installed
    Wait Until Element Is Visible  ${locHealthPageNavIcon}
    Click Element  ${locHealthPageNavIcon}
    Wait Until Page Does Not Contain  Pod Errors  5m
    Wait Until Page Contains  Pods
    ${app_name_lower} =  Convert To Lower Case  ${application_name}
    ${expected_text} =  Set Variable If
    ...  '${app_name_lower}' == 'arkime'  -${app_name_lower}-  ${app_name_lower}  # else var just assigned app name
    ${app_on_health_page} =  Set Variable  False
    Wait Until Element Is Visible  ${locPodTableRows}
    ${pod_status_tables} =  Get WebElements  ${locPodTableRows}
    FOR  ${table}  IN  @{pod_status_tables}
        Click Element  ${table}
        Sleep  1s
        ${app_on_health_page} =  Run Keyword And Return Status  Page Should Contain  ${expected_text}
        Run Keyword If	'${app_on_health_page}' == 'True'  Exit For Loop
    END
    Run Keyword if  '${app_on_health_page}'=='False'  Fail  ${application_name} not listed on Health page

Uninstall App
    [Arguments]  ${application_name}
    [Documentation]  Uninstalls specified app via the Catalog page
    Click Element  ${locCatalogPageNavIcon}
    Wait Until Page Contains  ${application_name}
    ${index} =  Find App index  ${application_name}
    ${app_status_text} =  Get App Status Text  ${index}
    Return From Keyword If  '${app_status_text}' == 'Not Installed'  # App does not need to be uninstalled

    Log To Console  Uninstalling app: ${application_name}
    ${config_app_button} =  Set Variable  id=app-chart-list-${index}-app-card-div-div-div-button-configure-application
    Wait Until Page Contains Element  ${config_app_button}
    Click Button  ${config_app_button}
    Run Keyword If  '${application_name}' == 'Arkime'
    ...  Run Keywords    Run Keyword And Ignore Error    Wait Until Page Contains Element    ${locArkimeIsDependent}    timeout=2s
    ...  AND     Run Keyword And Ignore Error    Click Element    ${locArkimeIsDependentContBtn}
    Wait Until Page Contains Element  ${locSelectProcessDropdown}
    Click Element  ${locSelectProcessDropdown}
    Wait Until Element Is Visible  ${locUninstallButton}
    Click Element  ${locUninstallButton}
    Wait Until Element Contains  ${locSelectProcessDropdown}  Uninstall
    Sleep  1s  reason=Prevent Selenium from clicking Node Selection dropdown too quickly
    IF  '${application_name}' == 'Arkime' or '${application_name}' == 'Suricata' or '${application_name}' == 'Zeek'
        Wait Until Element Is Enabled  ${locNodeSelection}
        Click Element  ${locNodeSelection}
        Wait Until Element Is Visible  ${locFirstNodeOption}
        Click Element  ${locFirstNodeOption}
        SeleniumLibrary.Press Keys  None  ESCAPE
    END
    Wait Until Element Is Enabled  ${locCatalogRunBtn}
    Click Button  ${locCatalogRunBtn}
    ${application_card} =  Set Variable  id=app-chart-list-div-app-card-${index}
    Wait Until Keyword Succeeds  3x  5s  Check App Card Status  ${index}  Not Installed
    Check Notifications Panel  COMPLETED Uninstalling ${application_name}  5m
    Sleep  10s

Clean Up Catalog Page
    [Documentation]  Uninstalls all apps that have been installed on the Catalog page.
    Runner Open Browser  ${HOST}  ${BROWSER}
    Login Into DIP Controller    ${SSO_ADMIN_USERNAME}  ${NEW_SSO_ADMIN_PASSWORD}
    Wait Until Page Contains    Portal
    Wait Until Element Is Visible  ${locCatalogPageNavIcon}
    Click Element  ${locCatalogPageNavIcon}
    Wait Until Page Contains  CVAH CATALOG
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

Get App Status Text
    [Arguments]  ${index}
    [Documentation]  Returns the text of the install status on the app card located at specified index
    ...              on the Catalog page. Status could either be: "DEPLOYED," "Not Installed", or "FAILED"
    ${app_card_status} =  Set Variable  xpath=//*[@id="app-chart-list-div-app-card-${index}"]/div/div[2]/div[1]/div[2]
    Wait Until Page Contains Element  ${app_card_status}
    ${app_status_text} =  Get Text  ${app_card_status}
    ${app_status_text} =  Fetch From Right  ${app_status_text}  :
    ${app_status_text} =  Strip String  ${app_status_text}
    [Return]  ${app_status_text}
