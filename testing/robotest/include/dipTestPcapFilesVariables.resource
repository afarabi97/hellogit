*** Variables ***
${locPcapPlayBtn}           xpath=//td[text() = "~"]/following-sibling::td/button//em[text() = "play_arrow"]
${locDeletePcapBtn}         xpath=//td[text()="~"]/following-sibling::td/button[@mattooltip="Delete PCAP"]

# Playing PCAP Dialog Box
${locPcapDialogHostnameOpt}             xpath=//mat-option/span[contains(text(),"~")]
${locPcapPreserveTimestampCheckbox}     xpath=//mat-checkbox//div[following-sibling::span[contains(text(), "Preserve timestamp")]]
# ${locPcapSensorInterfaceOptn}       xpath=//mat-pseudo-checkbox[following-sibling::span[text() = "ens224"]]
${locPcapSensorInterfaceOptionOne}      xpath=//mat-pseudo-checkbox[following-sibling::span][1]
