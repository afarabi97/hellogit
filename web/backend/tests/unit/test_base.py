"""These are some baseline tests to ensure that the framework is functioning correctly."""
from flask.testing import FlaskClient


def test_should_have_a_flaskclient(client):
    """
    FlaskClient Works like a regular Werkzeug test client but has some knowledge about how Flask
    works.
    """
    assert isinstance(client, FlaskClient)


def test_should_have_empty_database(client):
    """Start with a blank database."""

    nodes = client.get("/api/kit/nodes")
    rulesets = client.get("/api/policy/ruleset")
    assert b"[]\n" == nodes.data
    assert b"[]\n" == rulesets.data
