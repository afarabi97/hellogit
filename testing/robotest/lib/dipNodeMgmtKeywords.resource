*** Settings ***
Resource    ../include/dipNodeMgmtVariables.resource


*** Keywords ***
Setup Control Plane
    [Documentation]  Keyword for deploying virtual DIP in CI/CD pipeline
    log  Setting up Control Plane on DIP kit
    ${cp_deployed} =  Get From Dictionary  ${KIT_STATUS}  control_plane_deployed
    IF  ${cp_deployed} == ${False}
        Navigate To Node Management
        Wait Until Element Is Enabled  ${locSetupCPButton}
        click  ${locSetupCPButton}
        Wait Until Page Contains Element  ${locCPDeployState}  30m
        Wait Until Element Contains  ${locCPDeployState}  check_circle  30m
        Check Notifications Panel  Setup Control Plane deploy job successfully completed on node 'control-plane.${DOMAIN}'.  5m
    ELSE
        log  Setup control plane already completed
    END

Server Setup
    [Documentation]  Adds the two required servers prior to deploying the DIP kit.
    Set Selenium Speed  0.5s
    log  Adding two server nodes to the kit
    Navigate To Node Management
    Enter Virtual Node Information  Server  ${VM_PREFIX}-server-1
    Enter Virtual Node Information  Server  ${VM_PREFIX}-server-2
    Verify Node Was Added  ${VM_PREFIX}-server-1  ${VM_PREFIX}-server-2  server_setup=${TRUE}

Node Setup
    [Documentation]  Adds the additional nodes to DIP kit during initial setup in CI/CD pipeline
    log  Adding sensor and service nodes to the kit
    Navigate To Node Management
    Enter Virtual Node Information  Sensor  ${VM_PREFIX}-sensor-3
    Enter Virtual Node Information  Service  ${VM_PREFIX}-service-4
    Enter Virtual Node Information  MinIO  ${VM_PREFIX}-minio-5
    Verify Node Was Added  ${VM_PREFIX}-sensor-3  ${VM_PREFIX}-service-4  ${VM_PREFIX}-minio-5

MIP Setup
    [Documentation]  Adds a virtual MIP to the DIP kit
    log  Adding a virtual MIP to the DIP kit
    Navigate To MIP Management
    ${mip_hostname} =  Set Variable  ${VM_PREFIX}-mip-6
    ${node_exists} =  Check If Node Exists  ${mip_hostname}
    IF  ${node_exists} == ${False}
        click  ${locNodeMgmtAddMipBtn}
        type  ${locNodeMgmtHostnameInput}  ${mip_hostname}
        click  ${locNodeMgmtAddNodeDialogIpAddressInput}
        click  ${locNodeMgmtAddNodeDialogIpAddressDropdownOpt1}
        click  ${locNodeMgmtAddNodeDialogVMRadioBtn}
        Wait Until Element Is Enabled  ${locNodeMgmtAddMipDialogSubmitBtn}
        click  ${locNodeMgmtAddMipDialogSubmitBtn}
        log  Completed entering MIP information.
        Check For Snack Bar Container
        Verify Node Was Added  ${mip_hostname}
    ELSE
        log  MIP with name "${mip_hostname}" already exists.
    END

Enter Virtual Node Information
    [Arguments]  ${node_type}  ${hostname}
    [Documentation]  Fills out the Add Node Dialog form on Node Management page
    ${node_exists} =  Check If Node Exists  ${hostname}
    IF  ${node_exists} == ${False}
        log  Entering node information in Add Node Dialog.
        click  ${locNodeMgmtAddNodeBtn}
        click  ${tmplLocNodeMgmtAddNodeDialogRadioBtn}  injector=${node_type}
        click  ${locNodeMgmtAddNodeDialogVMRadioBtn}
        type  ${locNodeMgmtHostnameInput}  ${hostname}
        click  ${locNodeMgmtAddNodeDialogIpAddressInput}
        click  ${locNodeMgmtAddNodeDialogIpAddressDropdownOpt1}
        Wait Until Element Is Enabled  ${locNodeMgmtAddNodeDialogSubmitBtn}
        click  ${locNodeMgmtAddNodeDialogSubmitBtn}
        log  Completed entering virtual node information.
        Check For Snack Bar Container
        ${verify_element} =  inject  ${tmplLocNodeProvProgressBar}  ${hostname}
        lookForElement  ${verify_element}  timeout=30m
    ELSE
        log  Node with name "${hostname}" already exists.
    END

Check If Node Exists
    [Arguments]  ${name}
    [Documentation]  Checks if a node with a specified hostname already exists on the kit
    Sleep  2s
    ${node_name_loc} =  Catenate  SEPARATOR=  ${locNodeHostnames}  [contains(text(), '${name}')]
    ${count} =  Get Element Count  ${node_name_loc}
    IF  ${count} > 0
        ${node_provision_error} =  inject  ${tmplLocNodeProvError}  ${name}
        ${node_deploy_error} =  inject  ${tmplLocNodeDeployError}  ${name}
        ${prov_error_count} =  Get Element Count  ${node_provision_error}
        ${deploy_error_count} =  Get Element Count  ${node_deploy_error}
        IF  ${prov_error_count} > 0 or ${deploy_error_count} > 0
            Delete Node  ${name}
        ELSE
            Return From Keyword  ${True}
        END
    END
    Return From Keyword  ${False}

Verify Node Was Added
    [Arguments]  @{node_names}  ${server_setup}=${FALSE}
    [Documentation]  Waits for a period of time to ensure
    ...              the newly added node has finish deploying
    FOR  ${node}  IN  @{node_names}
        log  Verifying node was added: ${node}
        IF  ${server_setup}
            ${verify_element}  inject  ${tmplLocNodeProvProgressBar}  ${node}
        ELSE
            ${verify_element}  inject  ${tmplLocNodeDeployProgressBar}  ${node}
        END
        lookForElement  ${verify_element}  timeout=35m
        log  Add Virtual Node was a success!
    END

Delete Node
    [Arguments]  ${hostname}
    [Documentation]  Deletes node with hostname passed in as ${hostname}.
    log  Delete node with hostname: ${hostname}
    ${node_name} =  lower  ${hostname}
    ${delete_button} =  inject  ${tmplDeleteNodeBtn}  ${node_name}
    ${count} =  Get Element Count  ${delete_button}
    IF  ${count} > 0
        click  ${delete_button}
        click  ${CVAH_CONFIRM_DIALOG__BUTTON_OPTIONS2_NOT_DOUBLE_CONFIRM}
        Sleep  3s
    END

Verify Node Was Deleted
    [Arguments]  @{node_names}
    FOR  ${node}  IN  @{node_names}
        log  Waiting for node to be deleted: ${node}
        gone  ${node}  wait_time=15m
        log  Delete Node was a success!
    END

Deploy Kit
    [Documentation]  Selects and initiates the "deploy kit" process in node management.
    ${kit_deployed} =  Get From Dictionary  ${KIT_STATUS}  base_kit_deployed
    ${deploy_kit_running} =  Get From Dictionary  ${KIT_STATUS}  deploy_kit_running
    IF  ${kit_deployed} == ${False} and ${deploy_kit_running} == ${False}
        Navigate To Node Management
        Wait Until Element Is Enabled  ${locDeployKitButton}
        click  ${locDeployKitButton}
        Sleep  20m  reason=Waiting for deployment of the Base Kit
        Wait Until Page Contains  PLAY RECAP  20m
        SeleniumLibrary.Press Keys  None  ESCAPE
        Check Notifications Panel  Base kit deploy job successfully completed.  25m
    ELSE
        log  Base kit is already deployed.
    END
