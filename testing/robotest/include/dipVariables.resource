*** Variables ***
${SSO_FILE}                 /opt/sso-idp/sso_admin_password.txt

# First Login Screen Locator Variables
${usernameLocator}      id=username
${passwordLocator}      id=password
${logInLocator}         id=kc-login

# Strings That Screens Should Contain
${LOGIN_SCREEN_TITLE}       Log In
${UPDATE_PASSWORD_TITLE}    Update password
${EDIT_ACCOUNT_TITLE}       Edit Account
${OTP_PAGE_STRING}          Authenticator
${UPDATE_ACCOUNT_TITLE}     Update Account Information

# Update Password Screen Locator Variables
${newPasswordLocator}      id=password-new
${confirmpasswordLocator}  id=password-confirm
${submitLocator}           css=input[class*='btn']

# DoD Banner Locater Variables
${DOD_TERMS_CONDITIONS}     Terms and Conditions
${DODAcceptButton}       id=kc-accept