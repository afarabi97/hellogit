"""This file tests app.models.mongo."""
from app.utils.collections import Collections, get_collection
from mongomock.collection import Collection
from pytest import raises


def test_should_return_nodes_collection(client):
    """
    Write tests in the format "tests_should_<functionality>". To bypass the API and access the mock
    database directly, use get_collection().

    Args:
        client (FlaskClient): required for any test that interact with the database.
    """
    collection = get_collection(Collections.NODES)
    assert collection.name == "nodes"
    assert isinstance(collection, Collection)


def test_should_return_ruleset_collection(client):
    collection = get_collection(Collections.RULESET)
    assert collection.name == "ruleset"
    assert isinstance(collection, Collection)


def test_should_not_return_made_up_collection(client):
    """
    To assert that an error is raised, use the context manager and pytest.raises.

    Args:
        client (FlaskClient): explained above.
    """
    with raises(ValueError, match="Arguement must be in the Collections class."):
        get_collection("made_up_collection")
