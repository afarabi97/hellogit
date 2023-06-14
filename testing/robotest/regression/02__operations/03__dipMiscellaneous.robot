*** Settings ***
Resource    ../../lib/dipAPIDocsKeywords.resource
Resource    ../../lib/dipCommonKeywords.resource
Resource    ../../lib/dipHealthKeywords.resource
Resource    ../../lib/dipNodeMgmtKeywords.resource
Resource    ../../lib/dipPortalKeywords.resource
Resource    ../../lib/dipToolsKeywords.resource
Resource    ../../lib/dipPmoSupportKeywords.resource

Library    SeleniumLibrary    15s
Library    SSHLibrary         15s


Suite Setup       Open SSH Connection      ${HOST}                ${HOST_USERNAME}                ${HOST_PASSWORD}
Test Setup        Run Keywords             Runner Open Browser    ${HOST}                         ${BROWSER}
                  ...                      AND                    Set DIP Kit Global Variables
                  ...                      AND                    Log Into DIP Controller  ${SSO_ADMIN_USERNAME}    ${NEW_SSO_ADMIN_PASSWORD}
Test Teardown     Run Keywords             Log Out Of Controller  AND  Close All Browsers
Suite Teardown    Close All Connections

*** Test Cases ***
Check Controller Date And Time
    [Tags]  THISISCVAH-13860
    [Documentation]  Compares the datetime on the Controller UI with the response object from the
    ...              backend API and also to the current datetime from Robot's DateTime library.
    Compare Datetime (Frontend, Backend, Current)

Verify Common Links On Portal Page
    [Tags]  THISISCVAH-13831
    [Documentation]  Verifies that the common links that should be present on the Portal page of the
    ...              controller are visible with URL link, IP address, and login credentials.
    ${installed_apps} =  Get Installed Catalog Apps
    Navigate To Portal
    Check For Common Link Tiles  ${installed_apps}

Add And Delete Portal Link
    [Tags]  THISISCVAH-11520
    [Documentation]  Validates the functionality of the "add link" button located on the top-right
    ...              header section of the portal page.
    Navigate To Portal
    ${name} =  Set Variable  Google
    ${url} =  Set Variable  https://www.google.com/
    ${desc} =  Set Variable  Link to Google's search page.
    Add User Link  ${name}  ${url}  ${desc}
    Verify Link Works  ${name}  ${url}
    Delete User Link

Verify Content On Support Page
    [Tags]  THISISCVAH-8225
    [Documentation]  Verifies that the Controller has correct information on the Support Page under
    ...              all four sections (Help Desk, Service Now, PMO Support Site, Version Information).
    log  Checking contents of all four sections of the Support page.
    Navigate To Support
    Check Help Desk Section
    Check Service Now Section
    Check PMO Support Site Section
    Check Version Information Section

Check Node Info Dialog Boxes
    [Tags]  THISISCVAH-14154
    [Documentation]  Checks content of node info dialogs for each node on the Node Management page
    Navigate To Node Management
    &{nodes_list} =  Get Nodes
    log  ${nodes_list}
    Check Node Info Content  &{nodes_list}

Check Nodes On Health Page
    [Tags]  THISISCVAH-14083
    [Documentation]  Verify all kit nodes are listed and in the "Ready" state
    Navigate To Health
    Verify Nodes Are Ready

Check Catalog Apps On Health Page
    [Tags]  THISISCVAH-14084
    [Documentation]  Verify that installed catalog apps are present under Pods table on Health page.
    ${installed_apps} =  Get Installed Catalog Apps
    FOR  ${app}  IN  @{installed_apps}
        Check Health Page For App  ${app}
    END

Change Kit Password
    [Tags]  THISISCVAH-12363
    [Documentation]  First gets the initial kit password and tests the SSH connection to every
    ...              node on the kit. Then it changes the kit password, checks SSH to each node,
    ...              and finally changes the kit password back to the initial one.
    ${initial_kit_pw} =  Get Initial Kit Password
    Close Connection
    Perform Steps For Changing Kit Password  ${NEW_KIT_PASSWORD}
    Check SSH Connection For All Nodes  ${NEW_KIT_PASSWORD}
    Perform Steps For Changing Kit Password  ${initial_kit_pw}
    Check SSH Connection For All Nodes  ${initial_kit_pw}

Generate API Key And Check Authentication
    [Tags]  THISISCVAH-6996
    [Documentation]  This test needs to run LAST because it creates a new API key that expires in
    ...              under a minute and overwrites the global API key created for this test suite.
    Open Connection  ${HOST}
    Login  ${HOST_USERNAME}  ${HOST_PASSWORD}
    ${expiration} =  Set Variable  ${0.0125}  # 0.0125 hr == 0.75 min == 45 sec
    ${roles} =  Create List  controller-admin  controller-maintainer  operator
    Generate Global API Auth Token  ${expiration}  ${roles}
    Check Content Of API Key  ${expiration}  ${roles}
    Make API Request  ${expiration}
    Generate Global API Auth Token  # Create new API token for remaining tests
    Close Connection

# TFPlenum API Documentation Page
#     [Tags]  THISISCVAH-11921
#     [Documentation]  This test validates that the API docs page loads and does not return an error.
#     Navigate To API Docs
#     Validate API Documentation
#     Switch Window  MAIN
