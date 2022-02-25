*** Settings ***
Resource    ../include/dipNodeMgmtVariables.resource

Library    SeleniumLibrary    15s
Library    SSHLibrary         15s
Library    String
Library    Collections

*** Keywords ***
Enter Virtual Sensor Information
    [Documentation]    Opens the Add Node Dialog Button
    ...                And Enters In The Appropriate Information
    shoot              AddNode
    click              ${locNodeMgmtAddNodeBtn}
    ${node_name}       getItemFromLocCount                                 ${listLocNodeMgmtProgressBars}                 ${tmplTextnodeMgmtAddNodeHostname}    addend=1
    type               ${locNodeMgmtHostnameInput}                         ${node_name}
    shoot              AddNode
    type               ${locNodeMgmtAddNodeDialogIpAddressInput}           ${txtNodeMgmtAddNodeDialogInitialIpAddress}
    shoot              AddNode
    click              ${locNodeMgmtAddNodeDialogIpAddressDropdownOpt1}
    shoot              AddNode
    click              ${locNodeMgmtAddNodeDialogSensorRadioBtn}
    shoot              AddNode
    scrollAndClick     ${locNodeMgmtAddNodeDialogVMRadioBtn}
    shoot              AddNode
    click              ${locNodeMgmtAddNodeDialogSubmitBtn}
    shoot              AddNode
    log                Enter Virtual Sensor Information was a success!

Wait For ${wait_time} To Verify Sensor Was Added
    [Documentation]      Waits for a period of time to ensure
    ...                  the newly added sensor has finish deploying
    ${verify_element}    getItemFromLocCount                            ${listLocNodeMgmtProgressBars}    ${tmplLocNodeMgmtProgressBar}
    lookForElement       ${verify_element}                              timeout=${wait_time}
    shoot                AddNode
    log                  Add Virtual Sensor was a success!

Cleanup Virtual Sensors With The Name ${text}
    [Documentation]    Cleans up virtual sensors whose
    ...                name contains the passed in text.
    ...                Change text to a specific name to
    ...                use it a single node
    log                Cleaning up the virtual sensor
    shoot              AddNodeCleanup
    ${node_name}       lower                                ${text}
    # elem_obj could be a list, str, or None
    ${holder}          inject                               ${tmplListLocRobotTestCleanupDeleteBtn}    ${node_name}
    log                Fetching holders elements
    ${delBtns}         Get WebElements                      ${holder}
    ${delBtns_type}    getType                              ${delBtns}

    IF      '${delBtns_type}' == 'list'
        ${delBtns_length}        Get Length       ${delBtns}
        ${wait_time}        Evaluate    $delBtns_length * 360
        log        We have a list of length ${delBtns_length}
        FOR  ${delete_button}  IN  @{delBtns}
            click               ${delete_button}
            shoot               AddNodeCleanup
            click               ${locNodeMgmtAddNodeDoubleConfirmDeleteBtn}
            shoot               AddNodeCleanup
        END
        log        Cleaning ${delBtns_length} Sensors
        IF        $delBtns_length > 0
            log         Waiting for ${wait_time} seconds!
            gone        ${node_name}                                   wait_time=${wait_time}
        END
    END
    log        Sensor Cleanup Complete






