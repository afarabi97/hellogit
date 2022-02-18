*** Variables ***
${locArkimeIsDependent}          xpath=//h1[normalize-space()='arkime is dependent on arkime-viewer']
${locArkimeIsDependentContBtn}   id=cvah-confirm-dialog-button-options2
${locSelectProcessDropdown}      id=cvah-catalog-page-div-mat-card-div-mat-vertical-stepper-mat-step-process-form-group-form-mat-form-field-process-mat-select
${locInstallButton}              id=cvah-catalog-page-div-mat-card-div-mat-vertical-stepper-mat-step-process-form-group-form-mat-form-field-process-mat-select-mat-option-0
${locNodeSelection}              id=cvah-catalog-page-div-mat-card-div-mat-vertical-stepper-mat-step-process-form-group-form-div-mat-form-field-node-mat-select
${locFirstNodeOption}            id=cvah-catalog-page-div-mat-card-div-mat-vertical-stepper-mat-step-process-form-group-form-div-mat-form-field-node-mat-select-mat-option-0
${locMemLimitInput}              id=cvah-catalog-page-div-mat-card-div-mat-vertical-stepper-div-mat-step-configuration-overview-form-div-0-div-div-6-div-mat-form-field-control-name-text-input
${locInterfaceSelection}         xpath=//*[contains(@id, "-div-mat-form-field-control-name-interface-mat-select")]
${locFirstInterfaceOption}       xpath=//*[contains(@id, "-div-mat-form-field-control-name-interface-mat-select-0")]
${locHeapSizeInput}              id=cvah-catalog-page-div-mat-card-div-mat-vertical-stepper-div-mat-step-configuration-overview-form-div-0-div-div-2-div-mat-form-field-control-name-text-input
${locSuriPcapCheckbox}           xpath=//mat-checkbox/label/div[//following::span[contains(text(),"Enable writing PCAPs")]]
${locUninstalledAppCards}        xpath=//cvah-application-card[contains(@id, "cvah-chart-list-div-cvah-application-card")]//p[text()="Not Installed"]//ancestor::cvah-application-card
${locInterfaceOptionConnected}    xpath=//mat-option[contains(@id, "-div-mat-form-field-control-name-interface-mat-select")][./span['mat-option-text'][not(mat-icon)]]

@{INDEPENDENT_APP_LIST}                     Logstash          Suricata           Zeek         Rocketchat         Wikijs
@{ARKIME_DEPENDENT_APP_LIST}                Arkime-viewer    Arkime
@{CORTEX_MISP_HIVE_DEPENDENT_APP_LIST}      Cortex    Misp    Hive
