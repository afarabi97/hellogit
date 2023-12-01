*** Variables ***
${CATEGORY}                     integration  # default test category
${NEW_KIT_PASSWORD}             1qaz2wsx!QAZ@WSX
${KIBANA_USERNAME}              elastic

${DEFUALT_REPLACEMENT_PATTERN}  ~

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
