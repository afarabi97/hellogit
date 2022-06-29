from app.utils.utils import hash_file, hash_string
from flask.testing import FlaskClient
from pytest_mock.plugin import MockerFixture
from tests.unit import PROJECT_ROOT_DIR


def test_configuration_editor(client: FlaskClient, mocker: MockerFixture):
    config_url = "/api/agent/config"
    config_edit_url = "/api/agent/config_content/{config_name}/{config_type}"

    config_name = "test1234"
    payload = { "config_name": config_name,
                "install_endgame": False,
                "endgame_sensor_id": None,
                "endgame_sensor_name": None,
                "endgame_server_ip": None,
                "endgame_port":"443",
                "endgame_user_name":None,
                "endgame_password": None,
                "customPackages": {
                    "Sysmon":{
                        "configLocation":"templates/sysmonconfig-export.xml",
                        "hasEditableConfig":True
                    },
                    "Winlogbeat":{
                        "winlog_beat_dest_ip":"10.40.12.12",
                        "winlog_beat_dest_port":"5045",
                        "configLocation":"templates/winlogbeat.yml",
                        "hasEditableConfig":True
                    }
                }
            }

    response = client.post(config_url, json=payload)
    assert response.status_code == 200
    assert response.json[0]["config_name"] == config_name
    assert len(response.json[0]["customPackages"]) == 2

    response = client.get(config_edit_url.format(config_name=config_name, config_type="Winlogbeat"))
    assert response.status_code == 200
    assert response.json['filename'] == "templates/winlogbeat.yml"
    result = hash_file(str(PROJECT_ROOT_DIR) + "/agent_pkgs/winlogbeat/templates/winlogbeat.yml")
    result2 = hash_string(response.json['content'])
    assert result["md5"] == result2["md5"]

    response = client.post(config_edit_url.format(config_name=config_name, config_type="Winlogbeat"),
                           data="foo:bar", content_type="text/plain")
    assert response.status_code == 200
    assert response.json == {"success_message": "Successfully saved the Winlogbeat configuration!"}

    response = client.get(config_edit_url.format(config_name=config_name, config_type="Winlogbeat"))
    assert response.status_code == 200
    assert response.json['content'] == "foo:bar"
