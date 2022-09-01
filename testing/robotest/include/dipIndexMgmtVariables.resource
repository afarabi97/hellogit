*** Variables ***
${locIndexMgmtActionCloseOption}                xpath=//mat-option[@role="option"]/span[text()="Close"]
${locIndexMgmtActionBackupAndCloseOption}       xpath=//mat-option[@role="option"]/span[text()="Backup and close"]

${locIndexMgmtIndexActionBtnTmpl}               xpath=//button[@id='cvah-elasticsearch-index-management-button-~']/span


# ${index_action_next}                            xpath=//button[@id='cvah-elasticsearch-index-management-button-next']/span
${locIndexMgmtIndexActionNextBtn}                          xpath=//button[@id='cvah-elasticsearch-index-management-button-next']/span


# ${index_list_dropdown}                          xpath=//div[@id='mat-select-value-2']/span
${locIndexMgmtIndexListDropdown}           xpath=//mat-select[@id="cvah-elasticsearch-index-management-mat-select-list"]

${index_list_dropdown_item}                     xpath=//mat-option[@id='cvah-elasticsearch-index-management-list-mat-option-13']/mat-pseudo-checkbox

${locIndexMgmtIndexListDropdownItemsTmpl}           xpath=//mat-option[contains(@ng-reflect-value,'~')]/mat-pseudo-checkbox

${index_mgmt_update_btn}                        xpath=//button[@id='cvah-elasticsearch-index-management-button-update']/span

${health_page_error_toast}                      xpath=//div[@id='cdk-overlay-23']/snack-bar-container/simple-snack-bar/span
