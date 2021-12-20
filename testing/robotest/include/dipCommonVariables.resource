*** Variables ***
${SSO_ADMIN_USERNAME}           admin
${NEW_SSO_ADMIN_PASSWORD}       1qaz2wsx!QAZ@WSX
${KIBANA_USERNAME}              elastic

${SSO_FILE}                     /opt/sso-idp/sso_admin_password.txt

# Put a TILDE '~' in the spot you want to inject into! Use with:
#   inject count of ${first_element} into ${second_element} and wait ${wait_time}
${DEFUALT_REPLACEMENT_PATTERN}  ~

# API URLS
${API_CMD}                      /opt/tfplenum/.venv/bin/python3 /opt/sso-idp/gen_api_token.py --roles "controller-admin,controller-maintainer,operator"
${API_HEADER_KEY}               Authorization
${API_HEADER_VALUE}             Bearer {bearer_token}
${API_BASE_URL}                 http://${host}/api{endpoint}

# API Endpoints
# ${current_user_endpoint}        /current_user
# ${rulesets_endpoint}            /policy/ruleset
# ${sensor_info_endpoint}         /policy/sensor/info

# NESTING PREDICATE EXAMPLE
# //section[.//h1[@id='hi']]

# Not selecting direct children
# //table['mat-table']//tbody//tr[contains(@class,'example-element-row')][.//td[contains(@id,'type') and contains(text(), 'Suricata')]]


# //button[@id='cvah-policy-management-table-rule-set-td-1-actions-button-edit']/span/em

# //table['mat-table']/td

# //table['mat-table']//tbody//tr[contains(@class,'example-element-row')][.//td[contains(@id,'-is-enabled')]]

# //table['mat-table']//tbody//tr[contains(@class,'example-element-row')]

# //table['mat-table']//tbody//tr[contains(@class,'example-element-row')]/td[contains(@id,'-is-enabled')]


# Pages start with a capital
${Portal}                       https://${host}/portal
${Alerts}                       https://${host}/alerts
${Rulesets}                     https://${host}/rulesets
${PCAPs}                        https://${host}/pcaps
${NodeManagement}               https://${host}/node-mng
${Health}                       https://${host}/health
${Catalog}                      https://${host}/catalog


# First Login Screen
${locUsernameInput}             id=username
${locPasswordInput}             id=password
${locLogInButton}               id=kc-login

# Update Password Screen
${locNewPasswordInput}          id=password-new
${locConfirmPasswordInput}      id=password-confirm
${locSubmitButton}              css=input[class*='btn']

# DoD Banner
${locBannerAcceptButton}        id=kc-accept

${locOverlayClick}              xpath=//div[3]/div[3]

# Playing PCAP Dialog Box
${locPcapPlayBtn}               xpath=//em[@id="app-pcap-form-div-mat-card-mat-card-content-table-td-7-action-button-play-arow-em"]
${locPcapSensorHostname}        id=replay-pcap-dialog-div-mat-form-field-sensor-hostname-mat-select
${locPcapFirstSensorHostname}   xpath=//mat-option[@id='replay-pcap-dialog-div-mat-form-field-sensor-hostname-mat-select-mat-option-0']/span
${locPcapPreserveTimestamp}     xpath=//mat-checkbox[@id='mat-checkbox-1']/label/div
${locPcapSensorInterface}       xpath=//mat-select[@id='replay-pcap-dialog-div-mat-form-field-iface-mat-select']/div/div[2]/div
${locPcapEns224}                xpath=//mat-option[@id='replay-pcap-dialog-div-mat-form-field-iface-mat-select-mat-option-0']/mat-pseudo-checkbox
${locOverlayClick}              xpath=//div[3]/div[3]
${locPcapExecuteBtn}            xpath=//button[@id='replay-pcap-dialog-div-button-execute']/span

### DIP Controller Variables ###
# Side Nav Buttons
${locNotificationsNavIcon}  id=cvah-notifications-open-dialog-window
${locNotificationsPopup}    xpath=//*[contains(@id, "mat-dialog-")]
${locTopNotification}       id=cvah-notifications-dialog_window-0-0-statusactionapp
${locExpandSideNavIcon}     id=app-top-navbar-mat-drawer-container-mat-drawer-div-sidenav-trigger-mat-icon-arrow-forward


${locCatalogPageNavIcon}        id=app-top-navbar-mat-drawer-container-mat-drawer-mat-list-div-1-mat-list-item-5-mat-icon
${locHealthPageNavIcon}         id=app-top-navbar-mat-drawer-container-mat-drawer-mat-list-div-2-mat-list-item-0-mat-icon
${locSupportPageNavIcon}        id=app-top-navbar-mat-drawer-container-mat-drawer-mat-list-div-6-mat-list-item-0-mat-icon
${locPortalPageNavIcon}         id=app-top-navbar-mat-drawer-container-mat-drawer-mat-list-div-0-mat-list-item-2-mat-icon
${locRulesetNavIcon}            id=app-top-navbar-mat-drawer-container-mat-drawer-mat-list-div-3-mat-list-item-0-mat-icon

# Support Page
${locSystemVersionNumber}       id=cvah-pmo-support-version
${locServiceNowURL}             id=cvah-pmo-support-servicenow-website

# Portal Page
# ${locKibanaUserPassword}      id=cvah-portal-portal-link-1-logins
# ${locKibanaKitIP}             id=cvah-portal-portal-link-1-ip
${locElasticLoginButton}        xpath=(//p[@class="euiTitle euiTitle--xsmall secLoginCard__title"])[2]
