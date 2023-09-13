*** Settings ***
Resource    ../include/dipDockerRegistryVariables.resource


*** Keywords ***
Verify Docker Images Table Is Visible
    [Documentation]  Checks that the table loads and all rows of Docker images are visible
    lookForElement  ${locDITable}
    Element Text Should Be  ${locDITableTitle}  Docker Images
    Element Text Should Be  ${locDITableColName1}  Name
    Element Text Should Be  ${locDITableColName2}  Tags
    Element Text Should Be  ${locDITableColName3}  Image ID
    Element Text Should Be  ${locDITableColName4}  Image Size MB
    lookForElement  ${locDITableRows}

Compare Docker Registry Table Data
    [Arguments]  ${docker_registry_api_data}
    [Documentation]  Compares table data in UI with what is returned from backend API call
    ${api_data_list_length} =  Get Length  ${docker_registry_api_data}
    lookForElement  ${locDITableRows}
    ${num_rows} =  Get Element Count  ${locDITableRows}
    Should Be Equal As Integers  ${num_rows}  ${api_data_list_length}
    FOR  ${row}  IN RANGE  ${num_rows}
        ${image_name} =  Get Text  id=cvah-docker-registry-table-td-${row}-name
        ${image_tag} =  Get Text  id=cvah-docker-registry-table-td-${row}-tags
        ${image_id} =  Get Text  id=cvah-docker-registry-table-td-${row}-image-id
        ${image_size_mb} =  Get Text  id=cvah-docker-registry-table-td-${row}-image-size
        Should Be Equal As Strings  ${image_name}  ${docker_registry_api_data}[${row}][0]  strip_spaces=True
        Should Be Equal As Strings  ${image_tag}  ${docker_registry_api_data}[${row}][1]  strip_spaces=True
        Should Be Equal As Strings  ${image_id}  ${docker_registry_api_data}[${row}][2]  strip_spaces=True
        Should Be Equal As Strings  ${image_size_mb}  ${docker_registry_api_data}[${row}][3]  strip_spaces=True
    END
