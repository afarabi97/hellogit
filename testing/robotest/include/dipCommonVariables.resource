*** Variables ***
${CATEGORY}                     integration  # default test category
${SSO_ADMIN_USERNAME}           admin
${NEW_SSO_ADMIN_PASSWORD}       1qaz2wsx!QAZ@WSX
${NEW_KIT_PASSWORD}             1qaz2wsx!QAZ@WSX
${KIBANA_USERNAME}              elastic

${SSO_FILE}                     /opt/sso-idp/sso_admin_password.txt

${DEFUALT_REPLACEMENT_PATTERN}  ~

# API URLS
${API_CMD}                      /opt/tfplenum/.venv/bin/python3 /opt/sso-idp/gen_api_token.py --roles "controller-admin,controller-maintainer,operator"
${API_HEADER_KEY}               Authorization
${API_HEADER_VALUE}             Bearer {bearer_token}
${API_BASE_URL}                 http://${host}/api{endpoint}

# Pages start with a capital
${Portal_url}                   https://${host}/portal
${Alerts_url}                   https://${host}/alerts
${NodeManagement_url}           https://${host}/node-mng
${Catalog_url}                  https://${host}/catalog
${Health_url}                   https://${host}/health
${Rulesets_url}                 https://${host}/rulesets
${PCAPs_url}                    https://${host}/pcaps
${Tools_url}                    https://${host}/tools
${Support_url}                  https://${host}/support


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

# Test PCAP Files
${locDeletePcapBtn}             xpath=//td[text()="~"]/following-sibling::td/button[@mattooltip="Delete PCAP"]

# Playing PCAP Dialog Box
${locPcapPlayBtn}               xpath=//td[text() = "wannacry.pcap"]/following-sibling::td/button//em[text() = "play_arrow"]
${locPcapDialogHostnameOpt}     xpath=//mat-option/span[contains(text(),"~")]
${locPcapPreserveTimestamp}     xpath=//mat-checkbox//div[following-sibling::span[contains(text(), "Preserve timestamp")]]
${locPcapSensorInterfaceOptn}   xpath=//mat-pseudo-checkbox[following-sibling::span[text() = "ens224"]]

### DIP Controller Variables ###
# Side Nav Buttons
${locPortalPageNavIcon}         xpath=//mat-icon[following-sibling::div/h4[text() = "Portal"]]
${locAlertsPageNavIcon}         xpath=//mat-icon[following-sibling::div/h4[text() = "Alerts"]]
${locNodeMgmtPageNavIcon}       xpath=//mat-icon[following-sibling::div/h4[text() = "Node Management"]]
${locCatalogPageNavIcon}        xpath=//mat-icon[following-sibling::div/h4[text() = "Catalog"]]
${locHealthPageNavIcon}         xpath=//mat-icon[following-sibling::div/h4[text() = "Health"]]
${locRulesetNavIcon}            xpath=//mat-icon[following-sibling::div/h4[text() = "Rule Set"]]
${locPcapNavIcon}               xpath=//mat-icon[following-sibling::div/h4[text() = "Test PCAP Files"]]
${locToolsNavIcon}              xpath=//mat-icon[following-sibling::div/h4[text() = "Tools"]]
${locSupportPageNavIcon}        xpath=//mat-icon[following-sibling::div/h4[text() = "PMO Support"]]

${locNotificationsPopup}        xpath=//*[contains(@id, "mat-dialog-")]
${locTopNotificationMsg}        id=cvah-notifications-dialog_window-0-0-message

# Portal Page
${locAddLinkNameInput}          xpath=//input[following-sibling::span//mat-label[text() = "Link Name"]]
${locAddLinkUrlInput}           xpath=//input[following-sibling::span//mat-label[text() = "Link URL"]]
${locAddLinkDescInput}          xpath=//input[following-sibling::span//mat-label[text() = "Link Description"]]
${locUserLinkFirstTile}         xpath=//mat-grid-list/div[h3[text() = "User Links"]]/mat-grid-tile[1]
${locElasticLoginButton}        xpath=(//p[@class="euiTitle euiTitle--xsmall secLoginCard__title"])[2]

#Tools Page
${locChangeKitPassExp}          xpath=//cvah-change-password-form/mat-expansion-panel
