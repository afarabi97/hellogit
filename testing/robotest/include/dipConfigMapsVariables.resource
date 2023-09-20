*** Variables ***
${locConfigMapsTable}                       xpath=//cvah-config-map//mat-card
${locConfigMapsTableTitle}                  xpath=//cvah-config-map//mat-card//mat-card-title
${locConfigMapsTableColName1}               xpath=//cvah-config-map//mat-card//mat-card-content//table/thead/tr/th[1]
${locConfigMapsTableColName2}               xpath=//cvah-config-map//mat-card//mat-card-content//table/thead/tr/th[2]
${locConfigMapsTableColName3}               xpath=//cvah-config-map//mat-card//mat-card-content//table/thead/tr/th[3]
${locConfigMapsTableRows}                   xpath=//cvah-config-map//mat-card-content//table/tbody/tr[td/a]

${locConfigMapsFileTableColName1}           xpath=//cvah-config-map//mat-card-content//table/tbody/tr[2]/td/table/thead/tr/th[1]
${locConfigMapsFileTableColName2}           xpath=//cvah-config-map//mat-card-content//table/tbody/tr[2]/td/table/thead/tr/th[2]
${locConfigMapsFileTableRows}               xpath=//td[@id="cvah-config-map-table-config-map-td-*-expanded-detail"]/table/tbody/tr
