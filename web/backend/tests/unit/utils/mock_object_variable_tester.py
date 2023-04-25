import json


def json_object_key_value_checker(mock_list: dict, json_response: json) -> bool:
    json_dict = json_response
    pass_value = True

    for key in json_dict.keys():
        if mock_list.get(key) == None:
            pass_value = False

    for value in json_dict.values():
        if value not in mock_list.values():
            pass_value = False

    for key in json_dict.keys():
        if json_dict.get(key) != mock_list.get(key):
            pass_value = False

    return pass_value
