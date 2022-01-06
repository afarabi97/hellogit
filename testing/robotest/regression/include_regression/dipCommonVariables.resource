*** Variables ***
${SSO_ADMIN_USERNAME}       admin
${NEW_SSO_ADMIN_PASSWORD}   1qaz2wsx!QAZ@WSX

${SSO_FILE}                 /opt/sso-idp/sso_admin_password.txt

# First Login Screen
${locUsernameInput}      xpath=//*[@id="username"]
${locPasswordInput}      xpath=//*[@id="password"]
${locLogInButton}        xpath=//*[@id="kc-login"]

# Update Password Screen
${locNewPasswordInput}      xpath=//*[@id="password-new"]
${locConfirmPasswordInput}  xpath=//*[@id="password-confirm"]
${locSubmitButton}          css=input[class*='btn']

# DoD Banner
${locBannerAcceptButton}    xpath=//*[@id="kc-accept"]


### DIP Controller Variables ###
# Side Nav Buttons
${locSystemName}               xpath=//*[@id="app-root-app-top-navbar"]/mat-drawer-container/mat-drawer/div/h3/div
${locNotificationsNavIcon}     xpath=//*[@id="app-top-navbar-mat-drawer-container-mat-drawer-mat-list-mat-list-item-notifications-mat-icon"]
${locNotificationsNavIconAlt}  xpath=//mat-icon[contains(@id, "notifications-mat-icon")]
${locNotificationsPopup}       xpath=//*[contains(@id, "mat-dialog-")]
${locTopNotificationMsg}       xpath=//*[@id="cvah-notifications-dialog_window-0-0-message"]
${locAlertsNavIcon}            xpath=//*[@id="app-top-navbar-mat-drawer-container-mat-drawer-mat-list-div-0-mat-list-item-3-mat-icon"]
${locPortalNavIconAlt}         xpath=//mat-icon[text()="dashboard"]

${locSysSettingsNavIcon}    xpath=//*[@id="app-top-navbar-mat-drawer-container-mat-drawer-mat-list-div-1-mat-list-item-1-mat-icon"]
${locNodeMgmtNavIcon}       xpath=//*[@id="app-top-navbar-mat-drawer-container-mat-drawer-mat-list-div-1-mat-list-item-2-mat-icon"]
${locCatalogPageNavIcon}    xpath=//*[@id="app-top-navbar-mat-drawer-container-mat-drawer-mat-list-div-1-mat-list-item-5-mat-icon"]
${locHealthPageNavIcon}     xpath=//*[@id="app-top-navbar-mat-drawer-container-mat-drawer-mat-list-div-2-mat-list-item-0-mat-icon"]
${locRuleSetPageNavIcon}    xpath=//*[@id="app-top-navbar-mat-drawer-container-mat-drawer-mat-list-div-3-mat-list-item-0-mat-icon"]
${locSupportPageNavIcon}    xpath=//*[@id="app-top-navbar-mat-drawer-container-mat-drawer-mat-list-div-6-mat-list-item-0-mat-icon"]
${locExpandSideNavIcon}     xpath=//*[@id="app-top-navbar-mat-drawer-container-mat-drawer-div-sidenav-trigger-mat-icon-arrow-forward"]

# Health Page
${locNodeHealthTableBody}   xpath=//*[@id="app-root-app-top-navbar"]/mat-drawer-container/mat-drawer-content/div/app-system-health/div/mat-card[1]/mat-card-content/table/tbody
${locPodTableRows}          xpath=//app-health-dashboard-pod-table//table/tbody/tr

# Support Page
${locServiceNowURL}         xpath=//*[@id="cvah-pmo-support-servicenow-website"]
${locSystemVersionNumber}   xpath=//*[@id="cvah-pmo-support-version"]

# Shared Locators Throughout Dip Controller
${locConfirmDialogYesBtn}   xpath=//*[@id="app-confirm-dailog-div-button-options2"]
${locClearConsoleBtn}       xpath=//*[@id="app-server-stdout-div-mat-card-mat-card-header-mat-mat-card-title-button-clear-console"]
${locBottomMsgCloseBtn}     xpath=//*[contains(@id, "cdk-overlay-")]/snack-bar-container/simple-snack-bar/div/button

# Notifications Panel
${locAllNotificationTypeBtn}         xpath=//div[@class="cdk-global-overlay-wrapper"][2]//button[@id="cvah-notifications-dialog_window-button-name-all"]
${locCatalogNotificationTypeBtn}     xpath=//div[@class="cdk-global-overlay-wrapper"][2]//button[@id="cvah-notifications-dialog_window-button-name-catalog"]
${locCatalogNotificationTypeBtnAlt}  xpath=//div[@class="cdk-global-overlay-wrapper"][1]//button[@id="cvah-notifications-dialog_window-button-name-catalog"]
${locAllNotificationTypeBtn}         xpath=//div[@class="cdk-global-overlay-wrapper"][2]//button[@id="cvah-notifications-dialog_window-button-name-all"]
${locRulesynceNotificationTypeBtn}   xpath=//div[@class="cdk-global-overlay-wrapper"][2]//button[@id="cvah-notifications-dialog_window-button-name-rulesync"]
${locNotificationMessageContainer}   xpath=//div[@class="cdk-global-overlay-wrapper"][2]//div[@class="messageCenter"]
${locDeleteNotificationBtnIcon}      xpath=//button[contains(@id, "button-delete")]
${locMessageContainerScrollBarJSS}   div.cdk-global-overlay-wrapper  mat-dialog-container:first-of-type div.messageCenter
${locCatalogNotificationModal}       xpath=//div[@id="cdk-describedby-message-container"]

# Portal Page
${locPortalPageAddLinkBtn}         xpath=//button[@id="cvah-portal-title-button-add-link"]
${locAddLinkNameInput}             xpath=//div[.//mat-label[text()="Link Name"]]/input
${add_link_name_input_data}        Google
${locAddLinkUrlInput}              xpath=//div[.//mat-label[text()="Link URL"]]/input
${add_link_url_input_data}         https://www.google.com/
${locAddLinkDescriptionInput}      xpath=//div[.//mat-label[text()="Link Description"]]/input
${add_link_desc_input_data}        Testing link
${locAddLinkCancelBtn}             xpath=//button[contains(@id, "button-cancel")]
${locAddLinkSubmitBtn}             xpath=//button[contains(@id, "button-confirm")]
${locPortalPageUserLinksSection}   xpath=//mat-grid-list[.//h3[text()="User Links"]]
${locUserPortalLinkName}           xpath=//div[starts-with(@id,"cvah-portal-user-portal-link") and contains(@id,"-name")]
${locUserPortalLinkUrl}            xpath=//div[starts-with(@id,"cvah-portal-user-portal-link") and contains(@id,"-url")]
${locUserPortalLinkDescription}    xpath=//div[starts-with(@id,"cvah-portal-user-portal-link") and contains(@id,"-description")]
${locDeleteUserLinkBtn}            xpath=//button[starts-with(@id,"cvah-portal-user-portal-link") and contains(@id,"-button-delete")]
${locDeleteUserLinkConfirmBtn}     xpath=//button[starts-with(@id,"cvah-confirm-dialog-button-options") and contains(@id,"double-confirm")]