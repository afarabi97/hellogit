*** Settings ***
Resource    ../include/dipCommonVariables.resource

Library     TFPlenumLibrary.py


*** Keywords ***
Validate API Documentation
    [Documentation]  Checks to make sure API Docs page loads successfully and all sections are present.
    log  Checking API Documentation page
    Sleep  5s  reason=API Docs page takes time to load
    reload
    ${api_section_list} =  Create List  agent  alerts  app  catalog  coldlog  common  curator  diagnostics  health  hive  policy
    ...                                 jobs  kit  kubernetes  notifications  portal  scale  settings  token  tools  version
    FOR  ${item}  IN  @{api_section_list}
        Wait Until Page Contains Element  xpath=//span[text()="${item}"]
    END
    Page Should Contain Element  xpath=//h4/span[text()="Models"]
    log  API Documentation page loaded successfully and all sections are present

Generate Global API Auth Token
    [Arguments]  ${expiration}=${1}  ${roles_arg}=${None}
    [Documentation]  Generates an API Token with the specified expiration and roles
    ${roles_default} =  Create List  controller-admin  controller-maintainer  operator
    ${roles_list} =  Set Variable If  ${roles_arg} is ${None}  ${roles_default}  ${roles_arg}
    log  Generating API Auth Token with roles ${roles_list} and an expiration time of ${expiration} hour(s)
    ${roles_cat_str} =  Catenate  SEPARATOR=,  @{roles_list}
    ${api_cmd} =  Set Variable  /opt/tfplenum/.venv/bin/python3 /opt/sso-idp/gen_api_token.py
    ${API_TOKEN} =  Execute Command    ${api_cmd} --roles "${roles_cat_str}" --exp ${expiration}
    Set Global Variable  ${API_TOKEN}
    log  Successfully Generated API Auth Token: ${API_TOKEN}

Check Content Of API Key
    [Arguments]  ${expiration_arg}  ${roles_arg}
    [Documentation]  Check the payload data of API Key at https://jwt.io/
    ${expected_expiration} =  Evaluate  ${expiration_arg} * 60
    Go To  https://jwt.io/
    Double Click Element  xpath=//div[@id="encoded-jwt"]/div[contains(@class, "input")]
    Click Element  xpath=//div[@id="encoded-jwt"]/div[contains(@class, "input")]
    Press Keys  None  DELETE
    Press Keys  None  ${API_TOKEN}
    ${payload_text} =  Get Text  xpath=//div[@class="js-payload"]
    ${payload_dict} =  Evaluate  json.loads("""${payload_text}""")  modules=json
    ${issued_at} =  Get From Dictionary  ${payload_dict}  iat
    ${exp_time} =  Get From Dictionary  ${payload_dict}  exp
    ${actual_expiration} =  Evaluate  (${exp_time} - ${issued_at}) / 60
    log  API Expiration: ${actual_expiration} min
    Should Be Equal As Integers  ${expected_expiration}  ${actual_expiration}
    ${actual_roles} =  Get From Dictionary  ${payload_dict}  roles
    Lists Should Be Equal  ${roles_arg}  ${actual_roles}
    Go Back

Make API Request
    [Arguments]  ${expiration}
    [Documentation]  Make a backend API request to vefiry the API key allows the call to succeed.
    ${exp_in_sec} =  Evaluate  (${expiration} * 60 * 60)
    log  Making API call with valid API key
    ${kit_status} =  Check Kit Status
    log  ${kit_status}
    log  Waiting ${exp_in_sec} seconds for API key to expire
    log  Making API call with invalid (expired) API key
    Sleep  ${exp_in_sec}  reason=Wait for API key to expire
    Run Keyword And Expect Error  AttributeError: 'NoneType' object has no attribute 'json'    Check Kit Status
    log  SUCCESS: API key failed as expected after waiting ${exp_in_sec} seconds, the key is expired.
