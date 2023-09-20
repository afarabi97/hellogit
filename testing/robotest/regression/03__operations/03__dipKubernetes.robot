*** Settings ***
Resource    ../../lib/dipCommonKeywords.resource
Resource    ../../lib/dipConfigMapsKeywords.resource
Resource    ../../lib/dipDockerRegistryKeywords.resource
Resource    ../../lib/dipHealthKeywords.resource


Suite Setup       Open SSH Connection      ${HOST}                ${HOST_USERNAME}                ${HOST_PASSWORD}
Test Setup        Run Keywords             Runner Open Browser    ${HOST}                         ${BROWSER}
                  ...                      AND                    Set DIP Kit Global Variables
                  ...                      AND                    Log Into DIP Controller  ${SSO_ADMIN_USERNAME}    ${NEW_SSO_ADMIN_PASSWORD}
Test Teardown     Run Keywords             Log Out Of Controller  AND  Close All Browsers
Suite Teardown    Close All Connections

*** Test Cases ***
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

Ensure Config Maps Table Is Visible On Configuration Maps Page
    [Tags]  THISISCVAH-14618
    [Documentation]  Verifies that the table is visible on the page, the title is correct, and
    ...              checking that the table rows render on screen as well.
    Navigate To Configuration Maps
    Verify Config Maps Table Is Visible
    Verify Config File Sub table Is Visible

Confirm Files Are Listed On Config Maps Table
    [Tags]  THISISCVAH-14619
    [Documentation]  Checks that the config files are listed in the sub table under each
    ...              config name within the Config Maps table.
    ${config_map_api_data} =  Get Config Maps Data
    Navigate To Configuration Maps
    Compare Config Maps Table Data  ${config_map_api_data}

Ensure Docker Images Table Is Visible On Docker Registry Page
    [Tags]  THISISCVAH-14546
    [Documentation]  Verifies that the table is visible on the page, the title is correct, and
    ...              checking that the table rows render on screen as well.
    Navigate To Docker Registry
    Verify Docker Images Table Is Visible

Confirm Images Are Listed On Docker Images Table
    [Tags]  THISISCVAH-14547
    [Documentation]  Checking that the list of Docker images return from the backend API call
    ...              matches what is listed in the table on the Docker Registry page.
    ${docker_registry_api_data} =  Get Docker Registry Data
    Navigate To Docker Registry
    Compare Docker Registry Table Data  ${docker_registry_api_data}
