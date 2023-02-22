*** Settings ***
Resource    ../include/dipNodeMgmtVariables.resource


*** Keywords ***
MIP Setup
    [Documentation]  Adds a virtual MIP to the DIP kit
    log  Adding a virtual MIP to the DIP kit
    Navigate To MIP Management
    Enter Virtual MIP Information  ${VM_PREFIX}-mip-6
    Verify Node Was Added  ${VM_PREFIX}-mip-6

Enter Virtual MIP Information
    [Arguments]  ${mip_hostname}
    [Documentation]  Fills out the Add MIP Dialog form on MIP Management page
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
    ELSE
        log  MIP with name "${mip_hostname}" already exists.
    END

Delete MIP
    [Arguments]  ${hostname}
    [Documentation]  Deletes MIP with hostname passed in as ${hostname}.
    log  Delete MIP with hostname: ${hostname}
    ${node_name} =  lower  ${hostname}
    ${delete_button} =  inject  ${tmplDeleteMipBtn}  ${node_name}
    ${count} =  Get Element Count  ${delete_button}
    IF  ${count} > 0
        click  ${delete_button}
        click  ${CVAH_CONFIRM_DIALOG__BUTTON_OPTIONS2_NOT_DOUBLE_CONFIRM}
        Sleep  3s
    END