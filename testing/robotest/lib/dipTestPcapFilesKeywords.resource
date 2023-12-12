*** Settings ***
Resource    ../include/dipCommonVariables.resource
Resource    ../include/dipTestPcapFilesVariables.resource


*** Keywords ***
Upload And Delete PCAP File
    [Arguments]  ${pcap_file_name}
    Upload PCAP  ${pcap_file_name}
    reload
    lookFor  ${pcap_file_name}
    ${pcap_del_btn} =  Inject  ${locDeletePcapBtn}  ${pcap_file_name}
    scroll  ${pcap_del_btn}
    click  ${pcap_del_btn}
    click  ${CVAH_CONFIRM_DIALOG__BUTTON_OPTIONS2_NOT_DOUBLE_CONFIRM}
    lookFor  Successfully deleted ${pcap_file_name}.

Replay PCAP
    [Arguments]  ${pcap}  ${preserve_timestamp}=${True}
    ${sensor_name} =  Check For Sensor With Available Interface
    # The interface will not show up with Preserve Timestamp On, Only with it unselected
    # so if Preserve Timewstamp is checked off, do not select an interface
    click  ${locPcapPlayBtn}    injector=${pcap}
    click  ${CVAH_REPLAY_PCAP_DIALOG__SENSOR_HOSTNAME_MAT_SELECT}
    click  ${locPcapDialogHostnameOpt}  injector=${sensor_name}

    # determine if  preserve timestamp checked or unchecked
    ${raw_is_checked_str} =  Get Element Attribute  locator=${locPcapPreserveTimestampCheckbox}/input  attribute=aria-checked
    ${is_checked_str} =  lower  ${raw_is_checked_str}

    IF  ${preserve_timestamp} == ${False}
        IF  '${is_checked_str}' == 'true'
            Sleep  2s
            log  UNCHECKING PRESERVE TIMESTAMP
            click  ${locPcapPreserveTimestampCheckbox}
        END

        click  ${CVAH_REPLAY_PCAP_DIALOG__IFACE_MAT_SELECT}
        log  Selecting the first interface option since interface names are different on virtual and hardware
        click  ${locPcapSensorInterfaceOptionOne}
        escape  Play Pcap Options
    END

    log  Executing PCAP
    Click Button  ${CVAH_REPLAY_PCAP_DIALOG__BUTTON_EXECUTE}  # execute btn

Verify Historical Replay Of PCAP Completes
    Check Notifications Panel  notification_msg=Historical replay of wannacry.pcap has started.  timeout=1m
    Check Notifications Panel  notification_msg=Historical replay of wannacry.pcap is in progress.  timeout=1m
    Check Notifications Panel  notification_msg=Historical replay of wannacry.pcap has completed.  timeout=1m

Verify TCPReplayer Of PCAP Completes
    Check Notifications Panel  notification_msg=Live replay of wannacry.pcap has started.  timeout=1m
    Check Notifications Panel  notification_msg=Live replay of wannacry.pcap is in progress. TCPReplayer has finished executing  timeout=1m
    Check Notifications Panel  notification_msg=Live replay of wannacry.pcap has completed.  timeout=1m
