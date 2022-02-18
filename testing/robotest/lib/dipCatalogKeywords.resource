*** Settings ***
Resource    ../include/dipCommonVariables.resource
Resource    ../include/dipCatalogVariables.resource
Variables    ../include/element_ids_frontend.py


*** Keywords ***
Install/Uninstall Every App
    [Documentation]  Installs apps from Catalog page and verifies successful install by checking the app card, notifications
    ...              and the Health page. The app is then immediately uninstalled.
    Set Selenium Speed  0.5s
    Navigate To Catalog
    log     Installing all applications on Catalog page
    ${skip_apps} =  Create List  Arkime-viewer  Remote-health-agent  Hive  Misp
    Wait Until Element Is Visible  xpath=//*[contains(@id, "-cvah-application-card-div-div-div-h3-chart-application")]
    ${app_name_count} =  Get Element Count  xpath=//*[contains(@id, "-cvah-application-card-div-div-div-h3-chart-application")]
    FOR  ${index}  IN RANGE  ${app_name_count}
        ${app_name} =  Get Text  id=cvah-chart-list-${index}-cvah-application-card-div-div-div-h3-chart-application
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

Install Every App
    [Documentation]  Installs every app from Catalog page and verifies successful install by checking the app card, notifications
    ...              and the Health page.
    Set Selenium Speed  0.5s
    Navigate To Catalog


    ${skip_apps} =  Create List  Arkime-viewer  Remote-health-agent
    Wait Until Element Is Visible  xpath=//*[contains(@id, "-cvah-application-card-div-div-div-h3-chart-application")]
    ${app_name_count} =  Get Element Count  xpath=//*[contains(@id, "-cvah-application-card-div-div-div-h3-chart-application")]
    FOR  ${index}  IN RANGE  ${app_name_count}
        ${app_name} =  Get Text  id=cvah-chart-list-${index}-cvah-application-card-div-div-div-h3-chart-application
        Run Keyword If  '${app_name}' == 'Arkime'
        ...  Run Keywords  Install App  Arkime-viewer
        ...  AND  Install App  ${app_name}
        ...  ELSE IF  $app_name not in $skip_apps
        ...  Run Keywords  Install App  ${app_name}
    END

Install Multiple Apps
    [Arguments]  @{application_list}    ${asynchronous}=${TRUE}    ${retry}=60x    ${retry_interval}=10s    ${SKIP_ALL_VERIFICATION}=${FALSE}
    [Documentation]  Installs one or many apps from Catalog page. If the applications
    ...              are installed with the asynchronous flag set to ${TRUE}, each app
    ...              install is not confirmed until all apps have attempted to install
    ...              If the asynchronous flag is set to ${FALSE} the applications will
    ...              be installed in the exact order they are listed. Verification
    ...              will take place upon each application installation.
    ...              Set SKIP_ALL_VERIFICATION to handle verification on your own.
    Set Selenium Speed  0.5s
    ${retry_times} =  Set Variable If  ${IS_BARE_METAL_KIT}  150x  ${retry}
    log     Installing the following applications:
    FOR  ${appname}  IN  @{application_list}
        log     \t- ${appname}
    END
    FOR  ${application}  IN  @{application_list}
        Install App  ${application}    ${asynchronous}
    END

    IF    '${asynchronous}' == 'True' and '${SKIP_ALL_VERIFICATION}' == 'False'
        log     Starting Asynchronous Bulk Verification Of The Installed Applications
        log     The API Will Be Requested ${retry_times} times every ${retry_interval}.
        log     If the applications are not installed after the number of requests are met, the test will be marked as failing
        Wait Until Keyword Succeeds    ${retry_times}    ${retry_interval}    Verify Applications Have Installed    @{application_list}
    END

Perform Fast Install Of Catalog Apps
    [Arguments]          ${install_cortex_misp_hive}=${TRUE}    ${install_arkime}=${TRUE}
    [Documentation]      Installs independent apps before dependent ones. Verifies that
    ...                  the independent apps have successfully installed at the very end
    ...                  Set the boolean values for each dependent package to false to skip
    ...                  their installation.
    Set Selenium Speed  0.5s
    log     Perform Fast Install Of Catalog Apps
    log    Installation of independent applications will happen first
    log    Verification for independent applications will be done last

    # Install Independent Apps First
    Install Multiple Apps    @{INDEPENDENT_APP_LIST}    asynchronous=${TRUE}        SKIP_ALL_VERIFICATION=${TRUE}

    # Install Cortex Misp and Hive in that order
    IF    '${install_cortex_misp_hive}' == 'True'
        log     Starting Asynchronous Bulk Verification Of The Installed Applications
        Install Multiple Apps    @{CORTEX_MISP_HIVE_DEPENDENT_APP_LIST}    asynchronous=${FALSE}
    END

    # Install Arkime and the dependent application in the correct order
    IF    '${install_arkime}' == 'True'
        log    Installating Arkime and all of its dependents
        Install Multiple Apps    @{ARKIME_DEPENDENT_APP_LIST}    asynchronous=${FALSE}
    END

    # Perform the install verification of the independent applications since we skipped the verification at first
    # After waiting on the dependent applications to finish installing, we should already be installed so decrease
    # the verification time to 20x every 10s which is down from the normal 60x every 20s
    Wait Until Keyword Succeeds    20x    10s    Verify Applications Have Installed    @{INDEPENDENT_APP_LIST}

    log    All Specified Catalog Applications Have Been Successfully Installed!




Install Dependent Apps
    [Arguments]      @{application_list}
    Set Selenium Speed  0.5s
    log    Installing Apps Which Are Dependent In Respect To One Another
    Install Multiple Apps    @{application_list}    asynchronous=${FALSE}

Install Independent Apps
    [Arguments]      @{application_list}
    Set Selenium Speed  0.5s
    log    Installing Apps Which Are Independent In Respect To One Another
    Install Multiple Apps    @{application_list}    asynchronous=${TRUE}

Verify Applications Have Installed
    [Arguments]  @{application_list}
    log     Verify Applications Have Installed
    &{response_info_dict}=      Check Catalog Applications For State    @{application_list}    expected_state=DEPLOYED
    log    \nThe result for response_info_dict.status:\t ${response_info_dict.status}
    log    The result for response_info_dict.verified:\t ${response_info_dict.verified} \n
    IF      '${response_info_dict.status}' == 'False'
        log    Not Every Application Has Been Succesfully Installed
        log    Catalog Apps Successfully Verified To Have State ${expected_state}:\t ${response_info_dict.verified}
    END

    Should Be Equal    '${response_info_dict.status}'    'True'    msg=Each Application(s) State Must Be Verified    values=True    ignore_case=True    formatter=str

Uninstall Multiple Apps
    [Arguments]  @{application_list}
    [Documentation]  Uninstalls one or many apps from Catalog page.
    Set Selenium Speed  0.5s
    FOR  ${application}  IN  @{application_list}
        Uninstall App  ${application}
    END

Is App Already Installed
    [Arguments]    ${application_name}
    [Documentation]  Checks to see if the app is already installed

    @{one_app_list}=    Create List    ${application_name}
    &{response_info_dict}=      Check Catalog Applications For State    @{one_app_list}    expected_state=DEPLOYED
    IF      '${response_info_dict.status}' == 'True'
        log    ${application_name} Is Already Installed
        Return From Keyword    ${TRUE}
    END
    log    ${application_name} Is Not Installed
    Return From Keyword    ${FALSE}

Install App
    [Arguments]  ${application_name}    ${asynchronous}=${FALSE}
    [Documentation]  Downloads specified app from Catalog page
    Run Keyword if  ${IS_BARE_METAL_KIT}  Set Selenium Speed  1s
    ${already_installed} =    Is App Already Installed    ${application_name}
    IF  '${already_installed}' == 'True'
        Return From Keyword
    END

    IF  '${application_name}' == 'Arkime' or '${application_name}' == 'Suricata' or '${application_name}' == 'Zeek'
        ${sensor_name} =  Check For Sensor With Available Interface
    END

    log     Installing App: ${application_name}
    Navigate To Catalog
    reload

    ${index} =  Find App index  ${application_name}

    ${app_card_status} =  Set Variable  xpath=//*[@id="cvah-chart-list-div-cvah-application-card-${index}"]/div/div[2]/div[1]/div[2]
    lookForElement  ${app_card_status}
    ${app_status_text} =  Get Text  ${app_card_status}
    ${app_status_text} =  Fetch From Right  ${app_status_text}  :
    ${app_status_text} =  Strip String  ${app_status_text}
    # IF  '${app_status_text}' == 'DEPLOYED'
    #     log     ${application_name} has already been deployed
    #     Return From Keyword
    # END

    ${config_app_button} =  Set Variable  id=cvah-chart-list-${index}-cvah-application-card-div-div-div-button-configure-application
    lookForElement  ${config_app_button}
    Click Button  ${config_app_button}
    lookForElement  ${locSelectProcessDropdown}
    click  ${locSelectProcessDropdown}
    Wait Until Element Is Visible  ${locInstallButton}
    click  ${locInstallButton}
    Wait Until Element Contains  ${locSelectProcessDropdown}  Install
    Run Keyword if  '${application_name}' == 'Arkime' or '${application_name}' == 'Suricata' or '${application_name}' == 'Zeek'
    ...  Run Keywords  click  ${locNodeSelection}
    ...  AND  lookForElement  xpath=//span[text()="${sensor_name}"]
    ...  AND  click  xpath=//span[text()="${sensor_name}"]
    ...  AND  Press Keys  None  TAB
    ...  AND  Wait Until Element Is Enabled  id=${CVAH_CATALOG_PAGE__PROCESS_STEP_BUTTON_NEXT}
    ...  AND  Click Button  id=${CVAH_CATALOG_PAGE__PROCESS_STEP_BUTTON_NEXT}  # Next btn
    ...  AND  Run Keyword if  '${application_name}' == 'Arkime' and ${IS_BARE_METAL_KIT} is ${False}
    ...                        type  ${locMemLimitInput}  6Gi  # If virtual kit decrease memory limit from 20Gi to 6Gi
    ...  AND  Run Keyword if  '${application_name}' == 'Suricata'
    ...                         click  ${locSuriPcapCheckbox}
    ...  AND  shoot  InstallConfigOverviewPage
    ...  AND  click  ${locInterfaceSelection}
    ...  AND  Sleep  10s
    ...  AND  click  ${locInterfaceOptionConnected}
    ...  AND  Press Keys  None  TAB
    ...  AND  Wait Until Element Is Enabled  id=${CVAH_CATALOG_PAGE__CONFIG_STEP_BUTTON_NEXT}
    ...  AND  Click Button  id=${CVAH_CATALOG_PAGE__CONFIG_STEP_BUTTON_NEXT}  # Next btn
    ...  AND  Wait Until Element Is Enabled  id=${CVAH_CATALOG_PAGE__VALUES_STEP_BUTTON_RUN}
    ...  AND  Click Button  id=${CVAH_CATALOG_PAGE__VALUES_STEP_BUTTON_RUN}  # Run btn
    ...  ELSE
    ...  Run Keywords  Wait Until Element Is Enabled  id=${CVAH_CATALOG_PAGE__PROCESS_STEP_BUTTON_NEXT}
    ...  AND  Click Button  id=${CVAH_CATALOG_PAGE__PROCESS_STEP_BUTTON_NEXT}  # Next btn
    ...  AND  Run Keyword if  '${application_name}' == 'Logstash' and ${IS_BARE_METAL_KIT} is ${False}
    ...                        type  ${locHeapSizeInput}  4  # If virtual kit decrease heap_size from 12 to 4
    ...  AND  lookFor  server
    ...  AND  Wait Until Element Is Enabled  id=${CVAH_CATALOG_PAGE__CONFIG_STEP_BUTTON_NEXT}
    ...  AND  click  id=${CVAH_CATALOG_PAGE__CONFIG_STEP_BUTTON_NEXT}  # Next btn
    ...  AND  Wait Until Element Is Enabled  id=${CVAH_CATALOG_PAGE__VALUES_STEP_BUTTON_RUN}
    ...  AND  click  id=${CVAH_CATALOG_PAGE__VALUES_STEP_BUTTON_RUN}  # Run btn
    Sleep  10s
    Verify App Has Been Installed  ${application_name}    ${asynchronous}

Verify App Has Been Installed
    [Arguments]  ${application_name}    ${asynchronous}=${FALSE}
    [Documentation]  Checks if specified app was sucessfully installed on kit
    IF  '${asynchronous}' == 'True'
        log    Verify App Has Been Installed ${application_name}
        log    asynchronous is TRUE
        log    Skipping Individual Verification
    ELSE
        log    Verify App Has Been Installed ${application_name}
        log    Asynchronous is FALSE
        log    Starting Individual Verification
        @{one_app_list}=    Create List    ${application_name}
        ${retry_times} =  Set Variable If  ${IS_BARE_METAL_KIT}  150x  60x
        Wait Until Keyword Succeeds  ${retry_times}  10s  Verify Applications Have Installed    @{one_app_list}
        # Check Notifications For App  ${application_name}
        # Check Health Page For App  ${application_name}
    END

Check App Card Status
    [Arguments]  ${index}  ${expected_status}
    [Documentation]  Visual confirmation on the Catalog Page that the app is installed
    log     Check App Card Status
    Navigate To Catalog
    ${application_card} =  Set Variable  id=cvah-chart-list-div-cvah-application-card-${index}
    lookForElement  ${application_card}
    Wait Until Element Contains  ${application_card}  ${expected_status}  2m
    ${app_card_circle} =  Set Variable  id=cvah-chart-list-${index}-cvah-application-card-div-div-div-button
    ${circle_color} =  Set Variable If  '${expected_status}' == 'DEPLOYED'  rgb(30, 185, 128)
    ...  '${expected_status}' == 'Not Installed'  white
    Element Attribute Value Should Be  ${app_card_circle}  style  background-color: ${circle_color};

Check Notifications For App
    [Arguments]  ${application_name}
    [Documentation]  Check Notifications to see if app has been installed on controller
    log     Checking Notifications For App ${application_name}
    click  ${locNotificationsNavIcon}
    Wait Until Element Contains  ${locTopNotification}  COMPLETED Installing ${application_name}  10m
    Press Keys  None  ESCAPE
    Sleep  5s

Check Health Page For App
    [Arguments]  ${application_name}
    [Documentation]  Visual confirmation on the Health Page that the app is installed
    log     Check Health Page For App ${application_name}
    Navigate To Health
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
    Navigate To Catalog
    ${index} =  Find App index  ${application_name}

    ${app_card_status} =  Set Variable  xpath=//*[@id="cvah-chart-list-div-cvah-application-card-${index}"]/div/div[2]/div[1]/div[2]
    lookForElement  ${app_card_status}
    ${app_status_text} =  Get Text  ${app_card_status}
    ${app_status_text} =  Fetch From Right  ${app_status_text}  :
    ${app_status_text} =  Strip String  ${app_status_text}
    Return From Keyword If  '${app_status_text}' == 'Not Installed'  # App does not need to be uninstalled

    ${config_app_button} =  Set Variable  id=cvah-chart-list-${index}-cvah-application-card-div-div-div-button-configure-application
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
    Click Button  id=${CVAH_CATALOG_PAGE__PROCESS_STEP_BUTTON_RUN}
    ${application_card} =  Set Variable  id=cvah-chart-list-div-cvah-application-card-${index}
    Wait Until Keyword Succeeds  5x  5s  Check App Card Status  ${index}  Not Installed
    click  ${locNotificationsNavIcon}
    Wait Until Element Contains  ${locTopNotification}  COMPLETED Uninstalling ${application_name}  10m
    Press Keys  None  ESCAPE
    Sleep  10s

Clean Up Catalog Page
    [Documentation]  Uninstalls all apps that have been installed on the Catalog page.
    Set Selenium Speed  0.5s
    Runner Open Browser  ${HOST}  ${BROWSER}
    Login Into DIP Controller    ${SSO_ADMIN_USERNAME}  ${NEW_SSO_ADMIN_PASSWORD}
    lookFor    Portal
    Navigate To Catalog

    Wait Until Element Is Visible  xpath=//*[contains(@id, "-cvah-application-card-div-div-div-h3-chart-application")]
    ${app_name_count} =  Get Element Count  xpath=//*[contains(@id, "-cvah-application-card-div-div-div-h3-chart-application")]
    FOR  ${index}  IN RANGE  ${app_name_count}
        ${app_name} =  Get Text  id=cvah-chart-list-${index}-cvah-application-card-div-div-div-h3-chart-application
        Uninstall App  ${app_name}
    END
    Close Browser

Find App index
    [Arguments]  ${application_name}
    [Documentation]  Locates and returns index of application based on name supplied in argument.
    log     Find App Index ${application_name}
    Wait Until Element Is Visible  xpath=//*[contains(@id, "-cvah-application-card-div-div-div-h3-chart-application")]
    ${app_name_elements} =  Get WebElements  xpath=//*[contains(@id, "-cvah-application-card-div-div-div-h3-chart-application")]
    ${index} =  Set Variable  ${0}
    FOR  ${element}  IN  @{app_name_elements}
        ${app_name} =  Get Text  ${element}
        Return From Keyword If  '${app_name}' == '${application_name}'  ${index}
        ${index} =  Set Variable  ${index + 1}
    END
    Return From Keyword  ${-1}
