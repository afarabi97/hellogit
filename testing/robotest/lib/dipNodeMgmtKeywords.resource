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
    Verify Node Was Added  ${VM_PREFIX}-sensor-3  ${VM_PREFIX}-service-4

Check Node IP Range
    [Arguments]  ${node_type}
    click  ${locNodeMgmtAddNodeBtn}
    click  ${tmplLocNodeMgmtAddNodeDialogRadioBtn}  injector=${node_type}
    click  ${locNodeMgmtAddNodeDialogVMRadioBtn}
    click  ${locNodeMgmtAddNodeDialogIpAddressInput}

    ${first_ip_opt} =  Get Text  ${locNodeMgmtAddNodeDialogIpAddressDropdownOpt1}
    ${first_ip_opt} =  Strip String  ${first_ip_opt}
    ${first_ip_last_octet} =  Fetch From Right  ${first_ip_opt}  .
    ${first_ip_last_octet} =  Convert To Integer  ${first_ip_last_octet}

    ${last_opt_idx} =  Get Element Count  xpath=//mat-option
    ${last_ip_opt} =  Get Text  xpath=//mat-option[position()=${last_opt_idx}]
    ${last_ip_opt} =  Strip String  ${last_ip_opt}
    ${last_ip_last_octet} =  Fetch From Right  ${last_ip_opt}  .
    ${last_ip_last_octet} =  Convert To Integer  ${last_ip_last_octet}

    IF  '${node_type}' == 'Server' or '${node_type}' == 'Service'
        Should Be True  ${first_ip_last_octet} >= 40 and ${first_ip_last_octet} <= 49
    ELSE
        Should Be True  ${first_ip_last_octet} >= 50 and ${first_ip_last_octet} <= 95
    END

    SeleniumLibrary.Press Keys  None  ESCAPE
    click  ${locNodeMgmtCancelBtn}

Enter Virtual Node Information
    [Arguments]  ${node_type}  ${hostname}
    [Documentation]  Fills out the Add Node Dialog form on Node Management page
    ${node_exists} =  Check If Node Exists  ${hostname}
    Skip If  ${node_exists}  msg=Node with name "${hostname}" already exists.
    log  Entering node information in Add Node Dialog.
    click  ${locNodeMgmtAddNodeBtn}
    click  ${tmplLocNodeMgmtAddNodeDialogRadioBtn}  injector=${node_type}
    click  ${locNodeMgmtAddNodeDialogVMRadioBtn}
    type  ${locNodeMgmtHostnameInput}  ${hostname}
    Select Node IP Address  ${node_type}
    IF  '${node_type}' == 'MinIO'
        type  ${locNodeDataDriveSizeInGbInput}  500  clear_before=${True}
    END
    Wait Until Element Is Enabled  ${locNodeMgmtAddNodeDialogSubmitBtn}
    click  ${locNodeMgmtAddNodeDialogSubmitBtn}
    log  Completed entering virtual node information.
    Check For Snack Bar Container
    ${verify_element} =  inject  ${tmplLocNodeProvProgressBar}  ${hostname}
    lookForElement  ${verify_element}  timeout=30m

Select Node IP Address
    [Arguments]  ${node_type}
    [Documentation]  Server and Service nodes use the same range for IP addresses,
    ...              as does Sensor and MinIO. If adding a Service node or MinIO,
    ...              use the last option for IP address instead of the first.
    click  ${locNodeMgmtAddNodeDialogIpAddressInput}
    ${last_option} =  Get Element Count  xpath=//mat-option
    IF  '${node_type}' == 'Service' or '${node_type}' == 'MinIO'
        click  xpath=//mat-option[position()=${last_option}]
    ELSE
        click  ${locNodeMgmtAddNodeDialogIpAddressDropdownOpt1}
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
        lookForElement  ${verify_element}  timeout=40m
        log  Add Virtual Node was a success!
    END

Delete Node
    [Arguments]  ${hostname}
    [Documentation]  Deletes node with hostname passed in as ${hostname}.
    log  Delete node with hostname: ${hostname}
    ${node_name} =  lower  ${hostname}
    ${delete_button} =  inject  ${tmplLocDeleteNodeBtn}  ${node_name}
    ${count} =  Get Element Count  ${delete_button}
    IF  ${count} > 0
        click  ${delete_button}
        click  ${CVAH_CONFIRM_DIALOG__BUTTON_OPTIONS2_NOT_DOUBLE_CONFIRM}
        Wait Until Page Does Not Contain Element  ${delete_button}  1m
        Wait Until Page Does Not Contain  ${hostname}
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

Check Node Info Content
    [Arguments]  &{node_info}
    ${hostname_elements} =  Get WebElements  xpath=//cvah-node-mng//mat-card[2]//tbody/tr/td[1]/a
    FOR  ${hostname_element}  IN  @{hostname_elements}
        ${hostname} =  Get Text  ${hostname_element}
        click  ${hostname_element}
        Sleep  1s
        Element Should Contain  xpath=//cvah-node-info-dialog//div[1]/mat-list/mat-list-item[1]//h4  Hostname: ${hostname}
        Element Should Contain  xpath=//cvah-node-info-dialog//div[1]/mat-list/mat-list-item[2]//h4  CPU Cores: ${node_info}[${hostname}][3]
        Element Should Contain  xpath=//cvah-node-info-dialog//div[1]/mat-list/mat-list-item[3]//h4  Memory: ${node_info}[${hostname}][4]
        Element Should Contain  xpath=//cvah-node-info-dialog//div[1]/mat-list/mat-list-item[4]//h4  IP Address: ${node_info}[${hostname}][0]
        Element Should Contain  xpath=//cvah-node-info-dialog//div[1]/mat-list/mat-list-item[5]//h4  Mng MAC: ${node_info}[${hostname}][2]
        Element Should Contain  xpath=//cvah-node-info-dialog//div[1]/mat-list/mat-list-item[6]//h4  sda Drive: ${node_info}[${hostname}][5] GB
        Element Should Contain  xpath=//cvah-node-info-dialog//div[1]/mat-list/mat-list-item[7]//h4  sdb Drive: ${node_info}[${hostname}][6] GB
        Press Keys  None  ESCAPE
    END

Refresh Device Facts For Each Node
    [Arguments]  &{node_info}
    [Documentation]  Refreshes the device facts for each node on the kit, except for the Control-Plane and
    ...              the MIP, and then verifies refresh was completed by checking the notifications.
    FOR  ${hostname}  IN  @{node_info.keys()}
        IF  '${node_info}[${hostname}][1]' != 'Control-Plane' and '${node_info}[${hostname}][1]' != 'MIP'
            click  ${tmplLocRefreshDeviceFactsBtn}  injector=${hostname}
            Sleep  1s
            lookFor  Device facts job started for ${hostname}${SPACE}${SPACE}Check Notifications for results.
            Check Notifications Panel  ${hostname} device facts updated.  timeout=1m
        END
    END
