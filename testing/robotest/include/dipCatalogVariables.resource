*** Variables ***
${locArkimeAppCard}              id=app-chart-list-div-app-card-0
${locArkimeConfigAppBtn}         id=app-chart-list-0-app-card-div-div-div-button-configure-application
${locArkimeAppCardCircle}        id=app-chart-list-0-app-card-div-div-div-button
${locArkimeIsDependent}           xpath=//h1[normalize-space()='arkime is dependent on arkime-viewer']
${locArkimeIsDependentContinueBtn}    id=cvah-confirm-dialog-button-options2

${locArkimeViewerAppCard}        id=app-chart-list-div-app-card-1
${locArkimeViewerConfigAppBtn}   id=app-chart-list-1-app-card-div-div-div-button-configure-application
${locArkimeViewerAppCardCircle}  id=app-chart-list-1-app-card-div-div-div-button

${locCortexAppCard}              id=app-chart-list-div-app-card-2
${locCortexConfigAppBtn}         id=app-chart-list-2-app-card-div-div-div-button-configure-application
${locCortexAppCardCircle}        id=app-chart-list-2-app-card-div-div-div-button

${locHiveAppCard}                id=app-chart-list-div-app-card-3
${locHiveConfigAppBtn}           id=app-chart-list-3-app-card-div-div-div-button-configure-application
${locHiveAppCardCircle}          id=app-chart-list-3-app-card-div-div-div-button

${locLogstashAppCard}            id=app-chart-list-div-app-card-4
${locLogstashConfigAppBtn}       id=app-chart-list-4-app-card-div-div-div-button-configure-application
${locLogstashAppCardCircle}      id=app-chart-list-4-app-card-div-div-div-button

${locMispAppCard}                id=app-chart-list-div-app-card-5
${locMispConfigAppBtn}           id=app-chart-list-5-app-card-div-div-div-button-configure-application
${locMispAppCardCircle}          id=app-chart-list-5-app-card-div-div-div-button

${locRocketchatAppCard}          id=app-chart-list-div-app-card-7
${locRocketchatConfigAppBtn}     id=app-chart-list-7-app-card-div-div-div-button-configure-application
${locRocketchatAppCardCircle}    id=app-chart-list-7-app-card-div-div-div-button

${locSuricataAppCard}            id=app-chart-list-div-app-card-8
${locSuricataConfigAppBtn}       id=app-chart-list-8-app-card-div-div-div-button-configure-application
${locSuricataAppCardCircle}      id=app-chart-list-8-app-card-div-div-div-button

${locWikijsAppCard}              id=app-chart-list-div-app-card-9
${locWikijsConfigAppBtn}         id=app-chart-list-9-app-card-div-div-div-button-configure-application
${locWikijsAppCardCircle}        id=app-chart-list-9-app-card-div-div-div-button

${locZeekAppCard}                id=app-chart-list-div-app-card-10
${locZeekConfigAppBtn}           id=app-chart-list-10-app-card-div-div-div-button-configure-application
${locZeekAppCardCircle}          id=app-chart-list-10-app-card-div-div-div-button

${locSelectProcessDropdown}      id=app-catalog-page-div-mat-card-div-mat-vertical-stepper-mat-step-process-form-group-form-mat-form-field-process-mat-select
${locInstallButton}              id=app-catalog-page-div-mat-card-div-mat-vertical-stepper-mat-step-process-form-group-form-mat-form-field-process-mat-select-mat-option-0
${locNodeSelection}              id=app-catalog-page-div-mat-card-div-mat-vertical-stepper-mat-step-process-form-group-form-div-mat-form-field-node-mat-select
${locFirstNodeOption}            id=app-catalog-page-div-mat-card-div-mat-vertical-stepper-mat-step-process-form-group-form-div-mat-form-field-node-mat-select-mat-option-0
${locMemLimitInput}              id=app-catalog-page-div-mat-card-div-mat-vertical-stepper-div-mat-step-configuration-overview-form-div-0-div-div-6-div-mat-form-field-control-name-text-input
${locInterfaceSelection}         xpath=//*[contains(@id, "-div-mat-form-field-control-name-interface-mat-select")]
${locFirstInterfaceOption}       xpath=//*[contains(@id, "-div-mat-form-field-control-name-interface-mat-select-0")]
${locHeapSizeInput}              id=app-catalog-page-div-mat-card-div-mat-vertical-stepper-div-mat-step-configuration-overview-form-div-0-div-div-2-div-mat-form-field-control-name-text-input
${locRunButton}                  id=app-catalog-page-div-mat-card-div-button-next-get-config


&{logstashLocators}            config_btn=${locLogstashConfigAppBtn}        app_card=${locLogstashAppCard}        app_card_circle=${locLogstashAppCardCircle}
&{logstashInstallDict}         Logstash=${logstashLocators}

&{zeekLocators}                config_btn=${locZeekConfigAppBtn}            app_card=${locZeekAppCard}            app_card_circle=${locZeekAppCardCircle}
&{zeekInstallDict}             Zeek=${zeekLocators}

&{suricataLocators}            config_btn=${locSuricataConfigAppBtn}        app_card=${locSuricataAppCard}        app_card_circle=${locSuricataAppCardCircle}
&{suricataInstallDict}         Suricata=${suricataLocators}

&{arkimeViewerLocators}        config_btn=${locArkimeViewerConfigAppBtn}    app_card=${locArkimeViewerAppCard}    app_card_circle=${locArkimeViewerAppCardCircle}
&{arkimeViewerInstallDict}     Arkime-viewer=${arkimeViewerLocators}

&{arkimeLocators}              config_btn=${locArkimeConfigAppBtn}          app_card=${locArkimeAppCard}          app_card_circle=${locArkimeAppCardCircle}
&{arkimeInstallDict}           Arkime=${arkimeLocators}

&{THISISCVAH_10191_APPS}        &{logstashInstallDict}    &{zeekInstallDict}    &{suricataInstallDict}    &{arkimeViewerInstallDict}    &{arkimeInstallDict}
