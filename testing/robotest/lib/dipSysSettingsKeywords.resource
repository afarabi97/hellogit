*** Settings ***
Resource    ../include/dipCommonVariables.resource
Resource    ../include/dipSysSettingsVariables.resource

*** Keywords ***
Fill Out System Settings
    [Documentation]  Fills out all applicable fields in each section on the System Settings page.
    log  Filling out system settings on the controller.
    Navigate To System Settings
    Complete VMware Settings
    Complete General Settings
    Complete Kit Settings
    Complete MIP Settings

Complete VMware Settings
    [Documentation]  Completes the VMware Settings section on the System Settings page of the controller.
    ${filled_out} =  Get From Dictionary  ${KIT_STATUS}  esxi_settings_configured
    IF  ${filled_out} == ${False}
        click  ${locVmwareSettingsSec}
        IF  ${IS_BARE_METAL_KIT}
            Enter ESXi Info
        ELSE
            Enter vCenter Info
        END
        Wait Until Element Is Enabled  ${locVMwareSaveButton}
        click  ${locVMwareSaveButton}
        Wait Until Page Contains  VMWare settings saved successfully.
        Check For Snack Bar Container
        Sleep  2s
    ELSE
        log  VMware Settings already filled out.
    END

Enter ESXi Info
    [Documentation]  Keyword runs if kit will use ESXi to build VMs
    Wait Until Element Is Visible  ${locVMwareIPAddress}
    Input Text  ${locVMwareIPAddress}  ${ESXI_IP_ADDRESS}
    Input Text  ${locVMwareUsername}  root
    Input Password  ${locVMwarePassword}  ${GEN_PW_ONE}
    Input Password  ${locRetypePWInput}  ${GEN_PW_ONE}
    Click Button  ${locTestConnectionBtn}
    Wait Until Page Contains  VMWare settings tested successfully.
    Check For Snack Bar Container
    Click Element  ${locDatastoreSelect}
    Wait Until Element Is Visible  ${locDatastore1Option}
    Click Element  ${locDatastore1Option}
    Wait Until Element Contains  ${locDatastoreSelect}  datastore1
    Click Element  ${locPortgroupSelect}
    Click Element  ${locInternalOptionSS}
    Wait Until Element Contains  ${locPortgroupSelect}  Internal

Enter vCenter Info
    [Documentation]  Keyword runs if kit will use vCenter to build VMs
    Set Selenium Speed  0.2
    type  ${locVMwareIPAddress}  ${VCENTER_IPADDRESS}
    type  ${locVMwareUsername}  ${VCENTER_USERNAME}
    Input Password  ${locVMwarePassword}  ${VCENTER_PASSWORD}
    Input Password  ${locRetypePWInput}  ${VCENTER_PASSWORD}
    click  ${locTestConnectionBtn}
    Wait Until Page Contains  VMWare settings tested successfully.  30s
    Check For Snack Bar Container

    click  ${locDatastoreSelect}
    click  ${locDevVsanOption}
    click  ${locPortgroupSelect}
    click  xpath=//mat-option[./span[text()='${VCENTER_PORTGROUP}']]
    ${vcenter_checked} =  Get Element Attribute  ${locVcenterCheckbox+'//input'}  aria-checked
    IF  '${vcenter_checked}'=='false'
        Mouse Over  ${locVcenterCheckbox+'//div[@class="mat-checkbox-inner-container"]'}
        Click Element  ${locVcenterCheckbox+'//div[@class="mat-checkbox-inner-container"]'}
    END
    click  ${locClusterSelect}
    click  ${locDevClusterOption}
    click  ${locDataCenterSelect}
    click  ${locDevDatacenterOption}
    click  ${locFolderSelect}
    click  xpath=//*[text()='${VCENTER_FOLDER}']

Complete General Settings
    [Documentation]  Completes the General Settings section on the System Settings page of the controller.
    ${filled_out} =  Get From Dictionary  ${KIT_STATUS}  general_settings_configured
    IF  ${filled_out} == ${False}
        click  ${locGeneralSettingsSec}
        Input Text  ${locDomainInputSS}  ${DOMAIN}
        click  ${locGeneralSaveButton}
        click  ${locGenOpenConsoleBtn}
        Sleep  4m  reason=Need to reload page after about 90s
        Wait Until Keyword Succeeds  3x  5s  Check If Still Logged Into Controller
        Check Notifications Panel  Setup Controller create job successfully completed.  10m
        Navigate To System Settings
        Sleep  30s  Time required for kit settings input fields to become enabled.
    ELSE
        log  General Settings already filled out.
    END

Complete Kit Settings
    [Documentation]  Completes the Kit Settings section on the System Settings page of the controller.
    ${filled_out} =  Get From Dictionary  ${KIT_STATUS}  kit_settings_configured
    IF  ${filled_out} == ${False}
        click  ${locKitSettingsSec}
        click  xpath=//mat-radio-button[@value="DIP"]
        Input Password  ${locKitPasswordInput}  ${NEW_KIT_PASSWORD}
        Input Password  ${locKitRetypePWInput}  ${NEW_KIT_PASSWORD}
        type  ${locUpstreamNtpServer}  10.10.101.11
        type  ${locUpstreamDnsServer}  10.10.101.11
        click  ${locKSRSelect}
        click  ${locKSRFirstOption}
        Wait Until Element Is Enabled  ${locKitSaveButton}
        click  ${locKitSaveButton}
        click  ${locKitOpenConsoleBtn}
        Wait Until Page Contains  PLAY RECAP  1m
        SeleniumLibrary.Press Keys  None  ESCAPE  # Exit out of console
        Check Notifications Panel  Setup Controller Kit Settings create job successfully completed.  10m
        Navigate To System Settings
    ELSE
        log  Kit Settings already filled out.
    END

Complete MIP Settings
    [Documentation]  Completes the MIP Settings section on the System Settings page of the controller.
    Set Selenium Speed  0.2
    Navigate To System Settings
    click  ${locMipSettingsSec}
    Scroll Element Into View  ${locMipSaveButton}
    type  ${locRootPasswordInputSS}  ${NEW_KIT_PASSWORD}
    type  ${locRootRetypePassword}  ${NEW_KIT_PASSWORD}
    type  ${locUserPasswordInput}  ${NEW_KIT_PASSWORD}
    type  ${locUserRetypePassword}  ${NEW_KIT_PASSWORD}
    type  ${locLuksPasswordInput}  ${NEW_KIT_PASSWORD}
    type  ${locLuksRetypePassword}  ${NEW_KIT_PASSWORD}
    Wait Until Element Is Enabled  ${locMipSaveButton}
    Click Button  ${locMipSaveButton}
    Wait Until Page Contains  MIP Settings Successfully Saved
    Check For Snack Bar Container
