from pathlib import Path
from typing import List

import pytest
from changelog.gitrepo import GitRepo, Release
from changelog.logg import Changelog
from changelog.toc import TableOfContents
from changelog.version_helper import str_to_ver

FULL_TOC_VERSIONS = ["3.8", "3.9.0", "3.7.4", "3.7.5"]


@pytest.fixture(scope="session")
def toc_dir_full_no_toc(tmp_path_factory):
    """
    Creates a temporary directory and saves changelogs for all releases of the 'tfplenum' project in that directory.

    Args:
        tmp_path_factory: A factory function that creates a temporary directory.

    Returns:
        toc_directory: The path to the temporary directory where the changelogs are saved.
    """
    git_repo = GitRepo(project_name="tfplenum")
    toc_directory = tmp_path_factory.mktemp("test_toc_dir")
    releases = [git_repo.get_release(version) for version in FULL_TOC_VERSIONS]

    # inlinedj
    changelogs = [Changelog(release) for release in releases]
    for changelog in changelogs:
        changelog.save(directory=toc_directory, overwrite=False)
    return toc_directory


@pytest.fixture(scope="session")
def toc_dir_full_unreleased_no_toc(tmp_path_factory):
    """
    Creates a temporary directory for testing the TOC directory with full unreleased content but no TOC file.

    Args:
        tmp_path_factory: A factory function for creating temporary directories.

    Returns:
        The path to the temporary TOC directory.
    """
    git_repo = GitRepo(project_name="tfplenum")
    toc_directory = tmp_path_factory.mktemp("test_toc_dir")
    releases = [git_repo.get_release(version) for version in FULL_TOC_VERSIONS]
    fake_unreleased_file_path = toc_directory / "UNRELEASED.md"

    changelogs = [Changelog(release) for release in releases]
    for changelog in changelogs:
        changelog.save(directory=toc_directory, overwrite=False)

    # Create a fake unreleased file
    fake_unreleased_file_path.touch()
    return toc_directory


def assert_toc_attributes(toc: TableOfContents):
    """
    Asserts that the given TableOfContents object has the desired attributes.

    Args:
        toc (TableOfContents): The TableOfContents object to be checked.

    Raises:
        AssertionError: If any of the desired attributes are missing.
    """
    # assert that it has the desired attributes
    assert hasattr(toc, "title")
    assert hasattr(toc, "subtitle")
    assert hasattr(toc, "version_header")
    assert hasattr(toc, "directory")
    assert hasattr(toc, "path")
    assert hasattr(toc, "search_pattern")
    assert hasattr(toc, "versions")
    assert hasattr(toc, "save")
    assert hasattr(toc, "list_dir")


def assert_unreleased_in_index(index_path: str):
    """
    Asserts that the '[UNRELEASED]' text is present in the content of the index file.

    Args:
        index_path (str): The path to the index file.

    Raises:
        AssertionError: If the '[UNRELEASED]' text is not found in the index file. (parses the file as a string of markdown)
    """
    desired_text = "[UNRELEASED]"
    index_content: str

    with open(index_path, "r") as file:
        index_content = file.read()

    assert (
        desired_text in index_content
    ), f"{desired_text} not in index file located at {index_path}"


def assert_toc_values_after_save(toc: TableOfContents, changelog_dir: Path):
    """
    Asserts the values of the TableOfContents object after it has been saved.

    Args:
        toc (TableOfContents): The TableOfContents object to be tested.
        changelog_dir (Path): The directory where the changelog files are stored.
    """
    assert toc.directory.exists(), f"Index directory does not exist: {toc.directory}"
    assert toc.path, f"Index.md file does not exist at {toc.path}"

    # assert that it has the necessary values for the attributes to create the file on the system
    assert toc.path.exists(), f"Index.md file does not exist at {toc.path}"
    assert (
        toc.path.stat().st_size > 0
    ), f"Index.md file is empty at {changelog_dir / 'index.md'}"
    assert toc.path.is_file(), f"Index.md is not a file at {toc / 'index.md'}"

    # assert that it has the desired outputting interfaces
    assert (
        toc.title == "CVA/H Changelog Table of Contents"
    ), f"The TOC's title is not 'CVA/H Changelog Table of Contents': {toc.title}"
    assert (
        toc.subtitle
        == "This document contains a high-level overview of all changes made to the system."
    ), f"This document contains a high-level overview of changes made to the system : {toc.subtitle}"
    assert (
        toc.version_header == "System Versions"
    ), f"The TOC's version header is not 'Version': {toc.version_header}"

    # assert that it has accurately parsed and displayed the changelogs within the directory
    release_versions = [str(version) for version in toc.versions]
    assert (
        release_versions
    ), "The release versions are empty, this may not be the correct versions"
    assert len(toc.versions) == len(
        FULL_TOC_VERSIONS
    ), f"Index changelogs is not len(FULL_TOC_VERSIONS) {len(FULL_TOC_VERSIONS)}: {toc.changelogs}"
    assert toc.versions[0] == str_to_ver(
        "3.9"
    ), f"Index changelogs are not listed from latest to oldest: {toc.versions}"


def test_table_of_contents_init_without_directory():
    """
    Test that the table of contents can be initialized.
    """

    toc = TableOfContents()
    assert_toc_attributes(toc)

    # These should not raise an error
    assert toc.path is None
    assert toc.directory is None


def test_table_of_contents_list_directory(toc_dir_full_no_toc: Path, capsys):
    """
    Test that the table of contents can list the directory of changelogs.
    """

    toc = TableOfContents(toc_dir_full_no_toc)

    changelog_files = toc.list_dir()

    assert changelog_files
    assert len(changelog_files) == len(
        FULL_TOC_VERSIONS
    ), f"The number of changelogs in the directory is not {len(FULL_TOC_VERSIONS)} it is {len(changelog_files)}"
    assert len(toc.versions) == len(
        FULL_TOC_VERSIONS
    ), f"The number of versions in the directory is not {len(FULL_TOC_VERSIONS)} it is {len(toc.versions)}"
    assert (
        not toc.path.exists()
    ), f"index.md shouldn't exist at this point in the test: {toc.path}"


def test_create_table_of_contents_after_files_are_saved(toc_dir_full_no_toc: Path):
    """
    Test case to verify the creation of a table of contents after files are saved.

    Args:
        toc_dir_full_no_toc (Path): The directory path where the table of contents will be created.

    Returns:
        None
    """
    toc = TableOfContents(toc_dir_full_no_toc)
    toc.save()
    assert_toc_values_after_save(toc, toc_dir_full_no_toc)


def test_create_table_of_contents_after_save_with_unrelease(
    toc_dir_full_unreleased_no_toc, capsys
):
    """
    Test case to verify the creation of a table of contents after saving with an unreleased version.

    Args:
        toc_dir_full_unreleased_no_toc (str): The directory path of the table of contents with an unreleased version and no existing table of contents.
        capsys: The pytest fixture for capturing stdout and stderr.

    Returns:
        None
    """
    toc = TableOfContents(toc_dir_full_unreleased_no_toc)
    toc.save()

    changelog_files = toc.list_dir()
    index_path = str(
        [tfile for tfile in changelog_files if tfile.name == "index.md"][0]
    )
    assert_unreleased_in_index(index_path)
    assert_toc_values_after_save(toc, toc_dir_full_unreleased_no_toc)
