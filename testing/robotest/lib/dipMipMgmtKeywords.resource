*** Settings ***
Resource    ../include/dipMipMgmtVariables.resource


*** Keywords ***
MIP Setup
    [Documentation]  Adds a virtual MIP to the DIP kit
    log  Adding a virtual MIP to the DIP kit
    Navigate To MIP Management
    Enter Virtual MIP Information  ${VM_PREFIX}-mip-6
    Verify MIP Was Added  ${VM_PREFIX}-mip-6

Enter Virtual MIP Information
    [Arguments]  ${mip_hostname}
    [Documentation]  Fills out the Add MIP Dialog form on MIP Management page
    ${mip_exists} =  Check If MIP Exists  ${mip_hostname}
    IF  ${mip_exists} == ${False}
        click  ${locMipMgmtAddMipBtn}
        type  ${locMipMgmtHostnameInput}  ${mip_hostname}
        click  ${locMipMgmtAddMipDialogIpAddressInput}
        click  ${locMipMgmtAddMipDialogIpAddressDropdownOpt1}
        click  ${locMipMgmtAddMipDialogVMRadioBtn}
        Wait Until Element Is Enabled  ${locMipMgmtAddMipDialogSubmitBtn}
        click  ${locMipMgmtAddMipDialogSubmitBtn}
        log  Completed entering MIP information.
        Check For Snack Bar Container
    ELSE
        log  MIP with name "${mip_hostname}" already exists.
    END

Check If MIP Exists
    [Arguments]  ${name}
    [Documentation]  Checks if a MIP with a specified hostname already exists on the kit
    Sleep  2s
    ${mip_name_loc} =  Catenate  SEPARATOR=  ${locMipHostnames}  [contains(text(), '${name}')]
    ${count} =  Get Element Count  ${mip_name_loc}
    IF  ${count} > 0
        ${mip_provision_error} =  inject  ${tmplLocMipProvError}  ${name}
        ${mip_deploy_error} =  inject  ${tmplLocMipDeployError}  ${name}
        ${prov_error_count} =  Get Element Count  ${mip_provision_error}
        ${deploy_error_count} =  Get Element Count  ${mip_deploy_error}
        IF  ${prov_error_count} > 0 or ${deploy_error_count} > 0
            Delete MIP  ${name}
        ELSE
            Return From Keyword  ${True}
        END
    END
    Return From Keyword  ${False}

Verify MIP Was Added
    [Arguments]  ${mip_name}
    [Documentation]  Waits for a period of time to ensure
    ...              the newly added MIP has finish deploying
        log  Verifying MIP was added: ${mip_name}
        shoot  provision-state
        ${prov_state_icon} =  inject  ${tmplLocMipProvState}  ${mip_name}
        Wait Until Element Does Not Contain  ${prov_state_icon}  radio_button_checked  timeout=30m
        Wait Until Element Does Not Contain  ${prov_state_icon}  timelapse  timeout=30m
        ${prov_state_text} =  Get Text  ${prov_state_icon}
        IF  '${prov_state_text}' == 'cancel'
            click  ${prov_state_icon}
            click  ${prov_state_icon}//div
            click  ${locConsoleRefreshBtn}
            shoot  clicking-refresh-confirm-button
            click  ${locConsoleConfirmBtn}
            Press Keys  None  ESCAPE
            Wait Until Element Contains  ${prov_state_icon}  check_circle  timeout=1m
        END
        ${verify_element} =  inject  ${tmplLocMipDeployProgressBar}  ${mip_name}
        lookForElement  ${verify_element}  timeout=1h
        log  Add Virtual MIP was a success!

Delete MIP
    [Arguments]  ${hostname}
    [Documentation]  Deletes MIP with hostname passed in as ${hostname}.
    log  Delete MIP with hostname: ${hostname}
    ${mip_name} =  lower  ${hostname}
    ${delete_button} =  inject  ${tmplDeleteMipBtn}  ${mip_name}
    ${count} =  Get Element Count  ${delete_button}
    IF  ${count} > 0
        click  ${delete_button}
        click  ${CVAH_CONFIRM_DIALOG__BUTTON_OPTIONS2_NOT_DOUBLE_CONFIRM}
        Sleep  3s
    END
