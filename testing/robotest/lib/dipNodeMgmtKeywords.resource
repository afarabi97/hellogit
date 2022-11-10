*** Settings ***
Resource    ../include/dipNodeMgmtVariables.resource

Library    SeleniumLibrary    15s
Library    SSHLibrary         15s
Library    String

*** Keywords ***
Setup Control Plane
    log  Setting up Control Plane on DIP kit
    Navigate To Node Management
    Wait Until Element Is Enabled  ${locSetupCPButton}
    click  ${locSetupCPButton}
    Wait Until Page Contains Element  ${locCPDeployState}  30m
    Wait Until Element Contains  ${locCPDeployState}  check_circle  30m
    Check Notifications Panel  Setup Control Plane deploy job successfully completed on node 'control-plane.${DOMAIN}'.  5m

Enter Virtual Node Information
    [Arguments]         ${node_type}  ${hostname}
    [Documentation]     Adds virtual node (server, sensor, service) to the DIP kit
    ${node_exists} =  Check If Node Exists  ${hostname}
    Return From Keyword If  ${node_exists}
    log                 Entering node information in Add Node Dialog.
    click               ${locNodeMgmtAddNodeBtn}
    IF  '${node_type}' == 'server'
        click           ${locNodeMgmtAddNodeDialogServerRadioBtn}
    ELSE IF  '${node_type}' == 'sensor'
        click           ${locNodeMgmtAddNodeDialogSensorRadioBtn}
    ELSE IF  '${node_type}' == 'service'
        click           ${locNodeMgmtAddNodeDialogServiceRadioBtn}
    END
    scrollAndClick      ${locNodeMgmtAddNodeDialogVMRadioBtn}
    type                ${locNodeMgmtHostnameInput}                         ${hostname}
    click               ${locNodeMgmtAddNodeDialogIpAddressInput}
    click               ${locNodeMgmtAddNodeDialogIpAddressDropdownOpt1}
    click               ${locNodeMgmtAddNodeDialogSubmitBtn}
    log                 Completed entering virtual node information.
    click               xpath=//snack-bar-container//button  # message at bottom

Check If Node Exists
    [Arguments]  ${name}
    lookForElement  ${locNodeHostnames}
    ${node_name_loc} =  Catenate  SEPARATOR=  ${locNodeHostnames}  [contains(text(), '${name}')]
    ${count} =  Get Element Count  ${node_name_loc}
    IF  ${count} > 0
        log  Node with name "${name}" already exists.
        Return From Keyword  ${True}
    END
    Return From Keyword  ${False}

Verify Node Was Added
    [Arguments]  @{node_names}
    [Documentation]      Waits for a period of time to ensure
    ...                  the newly added node has finish deploying
    FOR  ${node}  IN  @{node_names}
        log                  Verifying node was added: ${node}
        ${verify_element}    inject  ${tmplLocNodeMgmtProgressBar}  ${node}
        lookForElement       ${verify_element}  timeout=30m
        log                  Add Virtual Node was a success!
    END

Delete Node
    [Arguments]  ${text}
    [Documentation]    Deletes node with hostname passed in as ${text}.
    ...                Change text to a specific name to
    ...                use it a single node
    log                Cleaning up the virtual nodes
    shoot              AddNodeCleanup
    ${node_name} =  lower  ${text}
    ${delete_button} =  inject  ${tmplListLocRobotTestCleanupDeleteBtn}  ${node_name}
    ${count} =  Get Element Count  ${delete_button}
    IF  ${count} > 0
        click  ${delete_button}
        click  ${locNodeMgmtAddNodeDoubleConfirmDeleteBtn}
    END

Verify Node Was Deleted
    [Arguments]  @{node_names}
    FOR  ${node}  IN  @{node_names}
        log  Waiting for node to be deleted: ${node}
        gone  ${node}  wait_time=15m
        log  Delete Node was a success!
    END
