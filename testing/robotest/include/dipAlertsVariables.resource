*** Variables ***
${HIVE_USERNAME}                admin@thehive.local
${HIVE_PASSWORD}                Password!123456
${ADMIN_PROFILE}                admin@thehive.local
${ORG_ADMIN_PROFILE}            org_admin@thehive.local

${locAlertsPlayAndStopBtn}      xpath=//app-top-navbar[@id='app-root-app-top-navbar']/mat-drawer-container/mat-drawer-content/div/cvah-security-alerts/div/mat-card/mat-card-header/div/mat-card-title/div[2]/button/span/mat-icon
${locAlertsRefreshBtn}          xpath=//app-top-navbar[@id='app-root-app-top-navbar']/mat-drawer-container/mat-drawer-content/div/cvah-security-alerts/div/mat-card/mat-card-header/div/mat-card-title/div[2]/button[2]/span/mat-icon

${locTableRows}                 xpath=//html[1]/body[1]/app-root[1]/app-top-navbar[1]/mat-drawer-container[1]/mat-drawer-content[1]/div[1]/cvah-security-alerts[1]/div[1]/mat-card[1]/mat-card-content[1]/table[1]/tbody[1]/tr
${locTableHeaders}              xpath=//html[1]/body[1]/app-root[1]/app-top-navbar[1]/mat-drawer-container[1]/mat-drawer-content[1]/div[1]/cvah-security-alerts[1]/div[1]/mat-card[1]/mat-card-content[1]/table[1]/thead[1]/tr[1]/th
${HIVE_IP}
