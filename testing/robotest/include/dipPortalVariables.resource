*** Variables ***
# Regular Expressions
${commonLinkIpRegEx}            (https://|IP address:\\s)\\d{1,3}.\\d{1,3}.\\d{1,3}.\\d{1,3}
${commonLinkLoginRegEx}         user/password:\\s\\w*@*.*-*|This application uses SSO for authentication.

# Locators
${locCommonLinkTile}            xpath=//mat-grid-tile[.//a[text()="https://~.${DOMAIN}"]]
${locAddLinkNameInput}          xpath=//input[following-sibling::span//mat-label[text() = "Link Name"]]
${locAddLinkUrlInput}           xpath=//input[following-sibling::span//mat-label[text() = "Link URL"]]
${locAddLinkDescInput}          xpath=//input[following-sibling::span//mat-label[text() = "Link Description"]]
${locUserLinkFirstTile}         xpath=//mat-grid-list/div[h3[text() = "User Links"]]/mat-grid-tile[1]