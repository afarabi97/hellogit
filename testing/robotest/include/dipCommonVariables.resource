*** Variables ***
${CATEGORY}                     integration  # default test category
${SSO_ADMIN_USERNAME}           admin
${NEW_SSO_ADMIN_PASSWORD}       1qaz2wsx!QAZ@WSX
${NEW_KIT_PASSWORD}             1qaz2wsx!QAZ@WSX
${KIBANA_USERNAME}              elastic

${SSO_FILE}                     /opt/sso-idp/sso_admin_password.txt

${DEFUALT_REPLACEMENT_PATTERN}  ~

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

${locPcapPreserveTimestampInput}     xpath=//mat-checkbox//div[following-sibling::span[contains(text(), "Preserve timestamp")]]/input
${locPcapSensorInterfaceOptn}   xpath=//mat-pseudo-checkbox[following-sibling::span[text() = "ens224"]]

${locPcapSensorInterfaceOptionOne}      xpath=//mat-pseudo-checkbox[following-sibling::span][1]

${locPreserveTimestampCheckbox}  xpath=//mat-checkbox[@formcontrolname="preserve_timestamp"]//input[@type='checkbox']



### DIP Controller Variables ###
# Side Nav Buttons
${locNavIconTmpl}               xpath=//mat-icon[following-sibling::div/h4[text() = "~"]]
${locLogoutNavIcon}             xpath=//mat-icon[text() = "exit_to_app"]

${locNotificationsPopup}        xpath=//*[contains(@id, "mat-dialog-")]
${locTopNotificationStatus}     id=cvah-notifications-dialog-0-0-statusactionapp
${locTopNotificationMsg}        id=cvah-notifications-dialog-0-0-message

${locSnackBarContainerBtn}      xpath=//snack-bar-container//button/span[text() = "Close" or text() = "OK"]

${locElasticLoginButton}        xpath=(//p[@class="euiTitle euiTitle--xsmall secLoginCard__title"])[2]

#Tools Page
${locChangeKitPassExp}          xpath=//cvah-change-password-form/mat-expansion-panel
