*** Settings ***
Resource    ../include/dipPortalVariables.resource
Variables   ../include/element_ids_frontend.py

Library     TFPlenumLibrary.py


*** Keywords ***
Check For Common Link Tiles
    [Arguments]  ${app_list}
    FOR  ${app_name}  IN  @{app_list}
        ${app} =  IF  '${app_name}' == 'logstash'  Set Variable  kibana  ELSE  Set Variable  ${app_name}
        IF  '${app}' != 'arkime-viewer' and '${app}' != 'netflow-filebeat' and '${app}' != 'suricata' and '${app}' != 'zeek'
            ${tile_elem_loc} =  Inject  ${locCommonLinkTile}  ${app}
            lookForElement  ${tile_elem_loc}
            log  Checking for IP address on grid tile
            ${ip_text} =  Get Text  ${tile_elem_loc}//div//div[2]
            Should Match Regexp  ${ip_text}  ${commonLinkIpRegEx}
            log  IP address (${ip_text}) is visible
            log  Checking for login information on grid tile
            ${login_text} =  Get Text  ${tile_elem_loc}//div//div[3]
            Should Match Regexp  ${login_text}  ${commonLinkLoginRegEx}
            log  Login information (${login_text}) is visible
        END
    END

Add User Link
    [Arguments]  ${name}  ${url}  ${description}
    click  ${CVAH_PORTAL_TITLE_BUTTON_ADD_LINK}
    type  ${locAddLinkNameInput}  ${name}
    type  ${locAddLinkUrlInput}  ${url}
    type  ${locAddLinkDescInput}  ${description}
    click  ${CVAH_MODAL_DIALOG_MAT__BUTTON_CONFIRM}
    ${loc_link_name} =  Inject  ${CVAH_PORTAL_USER_PORTAL_LINK_NAME}  0  replacement_pattern=*
    lookForElement  ${loc_link_name}
    Element Should Contain  ${loc_link_name}  ${name}

Verify Link Works
    [Arguments]  ${name}  ${url}
    ${loc_link_url} =  Inject  ${CVAH_PORTAL_USER_PORTAL_LINK_URL}  0  replacement_pattern=*
    click  ${loc_link_url}
    Switch Window  NEW
    Location Should Be  ${url}
    Wait Until Page Contains  ${name}
    Switch Window  MAIN

Delete User Link
    Set Selenium Speed  .5s
    ${delete_btn} =  Inject  ${CVAH_PORTAL_USER_PORTAL_LINK_BUTTON_DELETE}  0  replacement_pattern=*
    click  ${delete_btn}
    click  ${CVAH_CONFIRM_DIALOG__BUTTON_OPTIONS2_NOT_DOUBLE_CONFIRM}
    Wait Until Page Does Not Contain  ${locUserLinkFirstTile}