*** Settings ***
Resource    ../include/dipConfigMapsVariables.resource


*** Keywords ***
Verify Config Maps Table Is Visible
    [Documentation]  Checks that the Config Maps table loads and all rows are visible
    log  Checking Config Maps table and rows
    lookForElement  ${locConfigMapsTable}
    Element Text Should Be  ${locConfigMapsTableTitle}  Config Maps
    Element Text Should Be  ${locConfigMapsTableColName1}  Namespace
    Element Text Should Be  ${locConfigMapsTableColName2}  Config Name
    Element Text Should Be  ${locConfigMapsTableColName3}  Creation Date
    lookForElement  ${locConfigMapsTableRows}

Verify Config File Sub Table Is Visible
    [Documentation]  Checks that the File sub table is visible when expanded in Config Maps table
    log  Checking File sub table within Config Maps table
    ${first_row_expand} =  Replace String  ${CVAH_CONFIG_MAP_OUTER__NAMESPACE_A}  search_for=*  replace_with=0
    click  ${first_row_expand}
    ${fist_add_config_data_btn} =  Replace String  ${CVAH_CONFIG_MAP_TABLE__BUTTON_ADD_CONFIG_DATA}  search_for=*  replace_with=0
    lookForElement  ${fist_add_config_data_btn}
    Element Text Should Be  ${fist_add_config_data_btn}  Add Config Data
    Element Attribute Value Should Be  ${fist_add_config_data_btn}  mattooltip  Add Config Data
    Element Text Should Be  ${locConfigMapsFileTableColName1}  Filename
    Element Text Should Be  ${locConfigMapsFileTableColName2}  Actions
    ${first_edit_config_button} =  Replace String  ${CVAH_CONFIG_MAP_TABLE__BUTTON_EDIT}  search_for=*  replace_with=0
    Element Text Should Be  ${first_edit_config_button}  edit
    Element Attribute Value Should Be  ${first_edit_config_button}  mattooltip  Edit Config Data
    ${first_delete_config_button} =  Replace String  ${CVAH_CONFIG_MAP_TABLE__BUTTON_DELETE}  search_for=*  replace_with=0
    Element Text Should Be  ${first_delete_config_button}  delete
    Element Attribute Value Should Be  ${first_delete_config_button}  mattooltip  Remove Config Data

Compare Config Maps Table Data
    [Arguments]  ${config_map_api_data}
    [Documentation]  Compares table data in UI with what is returned from backend API call
    ${api_data_list_length} =  Get Length  ${config_map_api_data}
    lookForElement  ${locConfigMapsTableRows}
    ${num_rows} =  Get Element Count  ${locConfigMapsTableRows}
    Should Be Equal As Integers  ${num_rows}  ${api_data_list_length}
    FOR  ${row}  IN RANGE  ${num_rows}
        ${row_str} =  Convert To String  ${row}

        ${namespace} =  Replace String  ${CVAH_CONFIG_MAP_OUTER_TABLE__NAMESPACE_VALUE}  search_for=*  replace_with=${row_str}
        ${namespace_text} =  Get Text  ${namespace}
        ${config_name} =  Replace String  ${CVAH_CONFIG_MAP_TABLE__CONFIG_NAME}  search_for=*  replace_with=${row_str}
        ${config_name_text} =  Get Text  ${config_name}
        ${creation_date} =  Replace String  ${CVAH_CONFIG_MAP_TABLE__CREATION_DATE}  search_for=*  replace_with=${row_str}
        ${creation_date_text} =  Get Text  ${creation_date}

        Should Be Equal As Strings  ${namespace_text}  ${config_map_api_data}[${row}][0]  strip_spaces=True
        Should Be Equal As Strings  ${config_name_text}  ${config_map_api_data}[${row}][1]  strip_spaces=True
        Should Be Equal As Strings  ${creation_date_text}  ${config_map_api_data}[${row}][2]  strip_spaces=True

        Check Config Filenames  ${config_map_api_data}  ${row_str}
    END

Check Config Filenames
    [Arguments]  ${api_data}  ${curr_row}
    [Documentation]  Compares the filenames for each config listed in UI with
    ...              the list of filenames returned from API
    ${curr_row_expand} =  Replace String  ${CVAH_CONFIG_MAP_OUTER__NAMESPACE_A}  search_for=*  replace_with=${curr_row}
    click  ${curr_row_expand}

    ${loc_config_file_rows} =  Replace String  ${locConfigMapsFileTableRows}  search_for=*  replace_with=${curr_row}
    ${config_file_num_rows} =  Get Element Count  ${loc_config_file_rows}

    IF  ${config_file_num_rows} != 0
        ${loc_file_row} =  Replace String  ${CVAH_CONFIG_MAP_TABLE__FILENAME}  search_for=*  replace_with=${curr_row}  count=1

        FOR  ${file_row}  IN RANGE  ${config_file_num_rows}
            ${file_row_str} =  Convert To String  ${file_row}
            ${loc_filename} =  Replace String  ${loc_file_row}  search_for=*  replace_with=${file_row_str}
            ${filename_text} =  Get Text  ${loc_filename}
            Should Be Equal As Strings  ${filename_text}  ${api_data}[${curr_row}][3][${file_row}]  strip_spaces=True
        END
    END
