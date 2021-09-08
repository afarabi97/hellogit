*** Variables ***
${SSO_ADMIN_USERNAME}        admin
${NEW_SSO_ADMIN_PASSWORD}    1qaz2wsx!QAZ@WSX
${KIBANA_USERNAME}           elastic

${SSO_FILE}                 /opt/sso-idp/sso_admin_password.txt

# First Login Screen
${locUsernameInput}      id=username
${locPasswordInput}      id=password
${locLogInButton}        id=kc-login

# Update Password Screen
${locNewPasswordInput}      id=password-new
${locConfirmPasswordInput}  id=password-confirm
${locSubmitButton}          css=input[class*='btn']

# DoD Banner
${locBannerAcceptButton}    id=kc-accept


### DIP Controller Variables ###
# Side Nav Buttons
${locNotificationsNavIcon}  id=app-notifications-a-mat-icon-notifications-none
${locNotificationsPopup}    xpath=//*[contains(@id, "mat-dialog-")]
${locExpandSideNavIcon}     id=app-top-navbar-mat-drawer-container-mat-drawer-div-sidenav-trigger-mat-icon-arrow-forward
${locCatalogPageNavIcon}    id=app-top-navbar-mat-drawer-container-mat-drawer-mat-list-div-1-mat-list-item-5-mat-icon
${locHealthPageNavIcon}     id=app-top-navbar-mat-drawer-container-mat-drawer-mat-list-div-2-mat-list-item-0-mat-icon
${locSupportPageNavIcon}    id=app-top-navbar-mat-drawer-container-mat-drawer-mat-list-div-6-mat-list-item-0-mat-icon
${locPortalPageNavIcon}     id=app-top-navbar-mat-drawer-container-mat-drawer-mat-list-div-0-mat-list-item-2-mat-icon

# Support Page
${locSystemVersionNumber}   id=cvah-pmo-support-version
${locServiceNowURL}         id=cvah-pmo-support-servicenow-website

# Portal Page
${locKibanaUserPassword}   id=cvah-portal-portal-link-1-logins
${locKibanaKitIP}          id=cvah-portal-portal-link-1-ip
${locElasticLoginButton}    xpath=(//p[@class="euiTitle euiTitle--xsmall secLoginCard__title"])[2]
