*** Variables ***
${SSO_FILE}                     /opt/sso-idp/sso_admin_password.txt
${SSO_ADMIN_USERNAME}           admin
${NEW_SSO_ADMIN_PASSWORD}       1qaz2wsx!QAZ@WSX

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
