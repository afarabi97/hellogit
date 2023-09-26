import pytest
from flask.testing import FlaskClient
from pytest_mock.plugin import MockerFixture
from tests.unit.models.mock_general_settings import \
    MockGeneralSettingsFormModel
from tests.unit.models.mock_mip_schema import MipSchemaDBModel
from tests.unit.static_data.jobs import mock_job_id_model
from tests.unit.static_data.mip import mock_mip_model_1, mock_mip_model_2


@pytest.fixture
def general_settings_form():
    return MockGeneralSettingsFormModel()


@pytest.fixture
def mip_schema_db_model():
    return MipSchemaDBModel()


# Test MipCtrlApi

def test_post_mip_202(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.mip_controller.post_mip", return_value=mock_job_id_model)
    response = client.post("/api/kit/mip", json=mock_mip_model_1)
    assert response.status_code == 202
    assert response.json["job_id"] == mock_job_id_model['job_id']


def test_post_mip_400_ValidationError(client: FlaskClient) -> None:
    response = client.post("/api/kit/mip", json=mock_mip_model_2)
    assert response.status_code == 400
    assert response.json["status"]
    assert response.json["messages"]


# Add Test back when LTAC readded
# def test_post_mip_400_PostValidationError(client: FlaskClient, mocker: MockerFixture, general_settings_form: MockGeneralSettingsFormModel, mip_schema_db_model: MipSchemaDBModel) -> None:
#     mips = [mip_schema_db_model]
#     error_message = ["Duplicate mip IP or hostname found. Only one is allowed."]
#     mocker.patch("app.models.nodes.GeneralSettingsForm.load_from_db", return_value=general_settings_form)
#     mocker.patch("app.models.nodes.Node.load_all_mips_from_db", return_value=mips)
#     response = client.post("/api/kit/mip", json=mock_mip_schema_1)
#     assert response.status_code == 400
#     assert response.json["post_validation"]["mip"] == error_message


def test_post_mip_500_Exception(client: FlaskClient, mocker: MockerFixture) -> None:
    mocker.patch("app.controller.mip_controller.post_mip", side_effect=Exception({"error": "mocked error"}))
    response = client.post("/api/kit/mip", json=mock_mip_model_1)
    assert response.status_code == 500
    assert response.json["error_message"]
