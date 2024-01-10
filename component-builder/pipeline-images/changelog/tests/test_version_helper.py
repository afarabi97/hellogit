import pytest
from changelog.version_helper import get_versions_within_range, str_to_ver
from packaging.version import Version


@pytest.fixture
def available_versions():
    return [
        Version("3.4.0.0"),
        Version("3.5.0.0"),
        Version("3.5.1.0"),
        Version("3.5.2.0"),
        Version("3.6.0.0"),
        Version("3.6.1.0"),
        Version("3.6.2.0"),
        Version("3.7.0.0"),
        Version("3.7.1.0"),
        Version("3.7.1.1"),
        Version("3.7.2.0"),
        Version("3.7.3.0"),
        Version("3.7.4.0"),
        Version("3.7.5.0"),
        Version("3.8.0.0"),
        Version("3.9.0.0"),
    ]


def assert_version_is_valid(version):
    # Is of type Version
    assert isinstance(version, Version)
    # version must be 4 components separated by dots
    version_string = version.public
    assert version_string.count(".") == 3
    # each component must be an integer
    assert all(component.isdigit() for component in version_string.split("."))
    # the first component must not be 0
    assert version_string.split(".")[0] != "0"


# @pytest.mark.parametrize("from_version, to_version, available_versions, expected", [
#     # Happy path tests
#     ("3.8", "3.9", [Version("3.8.1"), Version("3.8.2"), Version("3.9.0")], [(Version("3.8.0"), Version("3.8.1")), (Version("3.8.1"), Version("3.8.2")), (Version("3.8.2"), Version("3.9.0"))], 'happy-path-ascending'),
#     ("1.0", "2.0", [Version("1.0.1"), Version("1.1.0"), Version("2.0.0")], [(Version("1.0.0"), Version("1.0.1")), (Version("1.0.1"), Version("1.1.0")), (Version("1.1.0"), Version("2.0.0"))], 'happy-path-major-change'),
#     # Edge cases
#     ("3.8", "3.8.1", [Version("3.8.0.1")], [(Version("3.8.0"), Version("3.8.0.1"))], 'edge-case-single-subversion'),
#     ("3.8", "3.9", [Version("3.8.0")], [], 'edge-case-no-higher-version'),
#     # Error cases
#     ("3.9", "3.8", [Version("3.8.0"), Version("3.9.0")], [], 'error-case-invalid-range'),
#     ("3.8", "3.9", [], [], 'error-case-empty-available-versions'),
# ])
# def test_get_versions_within_range(from_version, to_version, available_versions, expected, test_id):
#     # Act
#     result = get_versions_within_range(from_version, to_version, available_versions)

#     # Assert
#     assert result == expected, f"Test failed for {test_id}"


@pytest.mark.parametrize(
    "version",
    [
        "3.7",
        "3.7.0",
        "3.7.0.0",
        "3.7.1",
        "3.7.1.0",
        "3.7.1.1",
        "3.7.2",
        "3.7.2.0",
        "3.7.3",
        "3.7.3.0",
        "3.7.4",
        "3.7.4.0",
        "3.7.5",
        "3.7.5.0",
        "3.8",
        "3.8.0.0",
        "3.9",
        "3.9.0",
        "3.9.0.0",
    ],
)
def test_parse_version(version):
    """
    Test the parse_version function which converts a version string to a Version object.

    Args:
        version (str): The version string to be parsed.

    Returns:
        None
    """
    parsed_version = str_to_ver(version)
    assert_version_is_valid(parsed_version)

    non_computed_version: Version = Version(version)
    non_computed_version_result = str_to_ver(non_computed_version)

    assert isinstance(non_computed_version_result, Version)


@pytest.mark.parametrize(
    "from_version, to_version, expected_versions",
    [
        (
            "3.7.1",
            "3.9",
            [
                ("3.7.1.0", "3.7.1.1"),
                ("3.7.1.1", "3.7.2.0"),
                ("3.7.2.0", "3.7.3.0"),
                ("3.7.3.0", "3.7.4.0"),
                ("3.7.4.0", "3.7.5.0"),
                ("3.7.5.0", "3.8.0.0"),
                ("3.8.0.0", "3.9.0.0"),
            ],
        ),
        ("3.7.5", "3.8", [("3.7.5.0", "3.8.0.0")]),
        (
            "3.7.2",
            "3.8",
            [
                ("3.7.2.0", "3.7.3.0"),
                ("3.7.3.0", "3.7.4.0"),
                ("3.7.4.0", "3.7.5.0"),
                ("3.7.5.0", "3.8.0.0"),
            ],
        ),
        ("3.8", "3.9", [("3.8.0.0", "3.9.0.0")]),
    ],
)
def test_get_versions_within_range(
    from_version, to_version, expected_versions, available_versions
):
    """
    Test function to verify the behavior of get_versions_within_range which returns a list of tuples of versions within a range.

    Args:
        from_version (str): The starting version.
        to_version (str): The ending version.
        expected_versions (list): List of expected versions within the range.
        available_versions (list): List of available versions.

    Returns:
        None
    """

    print(f"from_version: {from_version}, to_version: {to_version}")
    print(f"expected_versions: {expected_versions}")
    """
    changelog generate release --output-directory /tmp/changelogs
    changelog generate release --from-version 3.7.1 --to-version 3.9 --output-directory /tmp/changelogs
    changelog generate release --from-version 3.7.4 --to-version 3.8 --output-directory /tmp/changelogs
    changelog generate release --from-version 3.7.2 --to-version 3.8 --output-directory /tmp/changelogs
    changelog generate release --from-version 3.7.1 --to-version 3.9 --output-directory /tmp/changelogs
    """

    # get the list of versions that must be built to get from the oldest to the newest
    versions = get_versions_within_range(from_version, to_version, available_versions)

    print(f"versions: {versions}")
    assert len(versions) == len(expected_versions)

    # check that each tuple's from and to version are  of type Version
    for fromv, tov in versions:
        assert isinstance(fromv, Version)
        assert isinstance(tov, Version)

    # Check that the versions are in the expected order
    for i in range(len(versions)):
        assert versions[i][0].public == expected_versions[i][0]
        assert versions[i][1].public == expected_versions[i][1]
