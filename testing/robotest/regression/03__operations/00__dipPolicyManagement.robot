*** Settings ***
Resource    ../../lib/dipCatalogKeywords.resource
Resource    ../../lib/dipCommonKeywords.resource
Resource    ../../lib/dipRulesetKeywords.resource
Resource    ../../lib/dipTestPcapFilesKeywords.resource


Suite Setup       Open SSH Connection      ${HOST}                ${HOST_USERNAME}                ${HOST_PASSWORD}
Test Setup        Run Keywords             Runner Open Browser    ${HOST}                         ${BROWSER}
                  ...                      AND                    Set DIP Kit Global Variables
                  ...                      AND                    Log Into DIP Controller    ${SSO_ADMIN_USERNAME}    ${NEW_SSO_ADMIN_PASSWORD}
Test Teardown     Run Keywords             Log Out Of Controller  AND  Close All Browsers
Suite Teardown    Close All Connections

*** Test Cases ***
Sync Zeek And Suricata Rulesets
    [Tags]  THISISCVAH-10222
    [Documentation]  The robot portion of the test will add a ruleset folder and enable the already
    ...              present sample scripts. Since kibana information is validated using ansible
    ...              this particular test is to ensure the UI is working as intended. Although
    ...              this just syncs the rules, when combined with the output of THISISCVAH-10191
    ...              we gain a complete picture of the state of the UI & Backend
    Set Selenium Speed      0.5s
    Install Multiple Apps   Suricata  Zeek
    Edit Rule Set           Emerging Threats
    Edit Rule Set           Zeek Sample Scripts
    Add Rule Set            Zeek Integration Test Sample    Zeek Signatures
    Sync Rules
    Delete Rule Set         Zeek Integration Test Sample

Zeek Intel Script Upload
    [Tags]  THISISCVAH-12249
    [Documentation]  Validate the Zeek intel rules can be uploaded to the ruleset without errors.
    Set Selenium Speed  0.5s
    Add Rule Set        Zeek Intel Script Upload Test    Zeek Intel
    Upload Rules File   Zeek Intel Script Upload Test    mal_md5_robot.txt
    Delete Rule Set     Zeek Intel Script Upload Test

Replay PCAP With Preserve Timestamp Checked
    [Tags]  THISISCVAH-13323
    [Documentation]  Replaying a PCAP with a single sensor and the "Preserve timestamp"
    ...              checkbox is checked.
    Navigate To Test PCAP Files
    Replay PCAP  pcap=wannacry.pcap  preserve_timestamp=${True}
    Verify Historical Replay Of PCAP Completes

Replay PCAP With Preserve Timestamp Unchecked
    [Tags]  THISISCVAH-13323
    [Documentation]  Replaying a PCAP with a single sensor and the "Preserve timestamp"
    ...              checkbox is unchecked.
    Navigate To Test PCAP Files
    Replay PCAP  pcap=wannacry.pcap  preserve_timestamp=${False}
    Verify TCPReplayer Of PCAP Completes

Play PCAPs Across Sensor
    [Documentation]  Grab the elastic password and run some tests
    Set Selenium Speed  0.5s
    Navigate To Test PCAP Files
    Upload And Delete PCAP File  data-with-image_robot.pcap
    Replay PCAP  pcap=wannacry.pcap
