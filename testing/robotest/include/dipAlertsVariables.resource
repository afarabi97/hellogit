*** Variables ***
${HIVE_USERNAME}                admin@thehive.local
${HIVE_PASSWORD}                Password!123456
${ADMIN_PROFILE}                admin@thehive.local
${ORG_ADMIN_PROFILE}            org_admin@thehive.local

${locHiveSettings}              xpath=//app-top-navbar[@id='app-root-app-top-navbar']/mat-drawer-container/mat-drawer-content/div/app-security-alerts/div/mat-card/mat-card-header/div/mat-card-title/div[2]/button[3]/span/mat-icon
${locHiveAdminAPIKeyInput}      id=app-modal-dialog-mat-div-0-mat-form-field-textinput-input
${locHiveOrgAdminAPIKeyInput}   id=app-modal-dialog-mat-div-1-mat-form-field-textinput-input
${locHiveSettingsSaveBtn}       xpath=//button[@id='app-modal-dialog-mat-div-button-confirm']/span
${locAlertsPlayAndStopBtn}      xpath=//app-top-navbar[@id='app-root-app-top-navbar']/mat-drawer-container/mat-drawer-content/div/app-security-alerts/div/mat-card/mat-card-header/div/mat-card-title/div[2]/button/span/mat-icon
${locAlertsRefreshBtn}          xpath=//app-top-navbar[@id='app-root-app-top-navbar']/mat-drawer-container/mat-drawer-content/div/app-security-alerts/div/mat-card/mat-card-header/div/mat-card-title/div[2]/button[2]/span/mat-icon

${locTableRows}                 xpath=//html[1]/body[1]/app-root[1]/app-top-navbar[1]/mat-drawer-container[1]/mat-drawer-content[1]/div[1]/app-security-alerts[1]/div[1]/mat-card[1]/mat-card-content[1]/table[1]/tbody[1]/tr
${locTableHeaders}              xpath=//html[1]/body[1]/app-root[1]/app-top-navbar[1]/mat-drawer-container[1]/mat-drawer-content[1]/div[1]/app-security-alerts[1]/div[1]/mat-card[1]/mat-card-content[1]/table[1]/thead[1]/tr[1]/th

