*** Settings ***
Resource    ../include/dipPmoSupportVariables.resource

*** Keywords ***
Check Help Desk Section
    log  Verifying Help Desk information.
    Element Should Contain  ${locHelpDeskTitle}  Help Desk
    Element Should Contain  ${locHelpDeskHours}  Open between 0800-1700 Central (M-F).
    Element Should Contain  ${locHelpDeskPhone}  Call toll free 833-682-4488 or 210-729-5100.

Check Service Now Section
    log  Verifying Service Now website and email address.
    Element Should Contain  ${locServiceNowTitle}  Service Now
    Element Should Contain  ${CVAH_PMO_SUPPORT__A_SERVICENOW_WEBSITE}  https://afdco.servicenowservices.com/sp
    Element Should Contain  ${CVAH_PMO_SUPPORT__A_SERVICENOW_MAIL}  afdco@servicenowservices.com

Check PMO Support Site Section
    log  Verifying PMO support website address.
    Element Should Contain  ${locPmoSupportSiteTitle}  PMO Support Site
    Element Should Contain  ${CVAH_PMO_SUPPORT__A_INTELSHARE_WEBSITE}  https://intelshare.intelink.gov/sites/cvah-pmo

Check Version Information Section
    log  Verifying the version number, commit hash, and build date. System Version Number only checked when running a baremetal kit
    Sleep  2s  reason=Version number loads slightly after the element loads onto the page
    Element Should Contain  ${locVersionInfoTitle}  Version Information
    ${version_info} =  Get Version Information
    ${commit_hash} =  Get From Dictionary  ${version_info}  commit_hash
    ${build_date} =  Get From Dictionary  ${version_info}  build_date
    Run Keyword if  ${IS_BARE_METAL_KIT}  Element Should Contain  ${CVAH_PMO_SUPPORT__P_VERSION}  ${KIT_VERSION}
    Element Should Contain  ${CVAH_PMO_SUPPORT__P_COMMIT_HASH}  Commit Hash: ${commit_hash}
    Element Should Contain  ${CVAH_PMO_SUPPORT__P_BUILD_DATE}  Build Date: ${build_date}
