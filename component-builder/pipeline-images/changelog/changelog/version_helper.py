from typing import List, Tuple, Union

from packaging.version import Version

"""
Utilities for working with versions.

Version strings are converted to Version objects with 4 components.s
"""


def str_to_ver(version: Union[str, Version, None]) -> Union[Version, None]:
    """
    Converts a version string to a Numeric Version object with 4 components.
    Alphanumeric components are not yet supported.

    Args:
        version (str): The version string to convert. Can be a string or a Version object.

    Returns:
        Version: The converted Version object.

    Examples:
        >>> str_to_ver("1.2")
        Version("1.2.0.0")
        >>> str_to_ver("1.2.3")
        Version("1.2.3.0")
        >>> str_to_ver("1.2.3.4")
        Version("1.2.3.4")
    """
    if isinstance(version, Version):
        return version
    components = version.split(".")
    if any(not component.isdigit() for component in components):
        return None
    if len(components) == 2:
        components += ["0", "0"]
    elif len(components) == 3:
        components += ["0"]
    version_string = ".".join(components)
    return Version(version_string)


def increment_micro(version: Union[str, Version, None]) -> Union[Version, None]:
    if version is None:
        return None
    # Ensure the version is a Version  object
    if not isinstance(version, Version):
        version = Version(version)

    return Version(
        f"{version.release[0]}.{version.release[1]}.{version.release[2] + 1}.{version.release[3]}"
    )


def get_versions_within_range(
    from_version: str, to_version: str, available_versions: List[Version]
) -> List[Tuple[Version, Version]]:
    """
    Returns a list of tuples containing the versions within a specified range.

    Args:
        from_version (str): The starting version of the range.
        to_version (str): The ending version of the range.
        available_versions (List[Version]): The list of available versions.

    Returns:
        List[Tuple[Version, Version]]: A list of tuples, where each tuple contains the starting version and the next version within the range.

    Example:
        >>> get_versions_within_range(from_version='3.8', to_version='3.9', available_versions)
        [(Version("3.8.0.0"), Version("3.9.0.0"))]
    """

    _from_version: Version = str_to_ver(from_version)
    _to_version: Version = str_to_ver(to_version)
    versions = []
    while _from_version < _to_version:
        release_version = next(
            version for version in available_versions if version > _from_version
        )
        versions.append((_from_version, release_version))
        _from_version = release_version
    return versions
