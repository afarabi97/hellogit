*** Variables ***
${SSO_ADMIN_USERNAME}       admin
${NEW_SSO_ADMIN_PASSWORD}   1qaz2wsx!QAZ@WSX

${SSO_FILE}                 /opt/sso-idp/sso_admin_password.txt

# First Login Screen Locator Variables
${usernameLocator}      id=username
${passwordLocator}      id=password
${logInLocator}         id=kc-login

# Strings That Screens Should Contain
${LOGIN_SCREEN_TITLE}       Log In
${UPDATE_PASSWORD_TITLE}    Update password
${OTP_PAGE_STRING}          Authenticator
${UPDATE_ACCOUNT_TITLE}     Update Account Information
${PORTAL_PAGE_TITLE}        Portal

# Update Password Screen Locator Variables
${newPasswordLocator}      id=password-new
${confirmpasswordLocator}  id=password-confirm
${submitLocator}           css=input[class*='btn']

# DoD Banner Locater Variables
${DOD_TERMS_CONDITIONS}     Terms and Conditions
${DODAcceptButton}          id=kc-accept


### DIP Controller Variables ###
# Side Nav Buttons
${FULL_SYSTEM_NAME}         xpath=//*[@id="app-root-app-top-navbar"]/mat-drawer-container/mat-drawer/div/h3/div
${EXPAND_SIDE_NAV_ICON}     id=app-top-navbar-mat-drawer-container-mat-drawer-div-sidenav-trigger-mat-icon-arrow-forward
${CATALOG_PAGE_MENU_BTN}    id=app-top-navbar-mat-drawer-container-mat-drawer-mat-list-div-1-mat-list-item-4-mat-icon
${SUPPORT_PAGE_NAV_ICON}    id=app-top-navbar-mat-drawer-container-mat-drawer-mat-list-div-6-mat-list-item-0-mat-icon

# Catalog Page
${LOGSTASH_CONFIG_APP_BTN}  id=app-chart-list-2-app-card-div-div-div-button-configure-application

# Support Page
${SYSTEM_VERSION_NUMBER}    id=app-support-div-mat-card-mat-card-content-mat-grid-list-mat-grid-tile-div-div-p-version
${SERVICE_NOW_URL}          id=app-support-div-mat-card-mat-card-content-mat-grid-list-mat-grid-tile-div-div-a-servicenow-website