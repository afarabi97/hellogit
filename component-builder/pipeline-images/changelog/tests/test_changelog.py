import datetime
from pathlib import Path
from typing import List

import pytest
from changelog.gitrepo import GitRepo, Release
from changelog.logg import Changelog, ChangelogFileExistsError, MDCommit, Section


@pytest.fixture(scope="session")
def git_repo():
    return GitRepo(project_name="tfplenum")


@pytest.fixture(scope="session")
def changelog_dir(tmp_path_factory):
    return tmp_path_factory.mktemp("changelog")


@pytest.fixture
def release(request, git_repo: GitRepo):
    version = request.param
    return git_repo.get_release(version)


def assert_changelog_has_proper_sections(sections: List[Section]):
    assert isinstance(sections, list), f"Changelog sections is not a list: {sections}"
    assert len(sections) <= 3, f"Changelog has more than 3 sections: {sections}"

    for section in sections:
        assert isinstance(
            section, Section
        ), f"Changelog section is not a Section: {section}"
        assert hasattr(
            section, "commits"
        ), f"Section {section.title} does not have a commits attribute"
        assert isinstance(
            section.commits, list
        ), f"Section {section.title} commits is not a list: {section.commits}"
        assert all(
            commit.summary.startswith(section.commit_prefix)
            for commit in section.commits
        ), f"Section {section.title} has commits that do not start with {section.commit_prefix}"


def assert_section_has_proper_markdown(section: Section):
    markdown_commits: List[MDCommit] = section.markdown_commits

    assert hasattr(
        section, "markdown_title"
    ), f"Section {section.title} does not have a markdown_title attribute"
    assert hasattr(
        section, "markdown_commits"
    ), f"Section {section.title} does not have a markdown_commits attribute"
    assert isinstance(
        markdown_commits, list
    ), f"Section {section.title} markdown_commits is not a list: {markdown_commits}"
    assert all(
        isinstance(commit, MDCommit) for commit in markdown_commits
    ), f"Section {section.title} markdown_commits is not a list of MDCommit: {markdown_commits}"
    assert all(
        hasattr(commit, "detail") for commit in markdown_commits
    ), f"Section {section.title} markdown_commits is not a list of MDCommit: {markdown_commits}"


def assert_changelog_is_successfully_saved(changelog: Changelog, expected_path: Path):
    assert changelog.path.exists(), f"Changelog file does not exist: {changelog.path}"
    assert (
        changelog.path == expected_path
    ), f"Changelog file path ({changelog.path}) is not the expected path: {expected_path}"
    assert (
        expected_path.stat().st_size > 0
    ), f"Changelog file (current_path: {changelog.path}) at (expected_path: {expected_path}) is empty. "


def assert_changelog_exception_raised_on_save(changelog: Changelog, exception):
    exception_type = str(type(exception))
    exception_message = str(exception.value)
    changelog_release_version = str(changelog.release_version)

    assert isinstance(
        exception.value, ChangelogFileExistsError
    ), f"Exception is not of type ChangelogFileExistsError: {exception_type}"
    assert (
        exception_message
        == f"Changelog file for {changelog_release_version} already exists!"
    ), f"The Exception message is not correct: {exception_message}"


# ---------------------------------------------------------------------------- #
#                        CHANGELOG SECTION OF THE TESTS                        #
# ---------------------------------------------------------------------------- #


@pytest.mark.parametrize("release", ["3.8", "3.7.4", "3.7.5", "3.9"], indirect=True)
def test_generate_changelog_data(release: Release):
    """
    Generate changelog data for the given release.

    Args:
        release (Release): The release object for which to generate the changelog data.

    Raises:
        AssertionError: If any of the assertions fail.

    Returns:
        None
    """
    changelog = Changelog(release)

    # assert that it has the desired attributes
    assert hasattr(changelog, "title")
    assert hasattr(changelog, "release_date")
    assert hasattr(changelog, "release_version")
    assert hasattr(changelog, "release_hash")
    assert hasattr(changelog, "directory")
    assert hasattr(changelog, "path")
    assert hasattr(changelog, "sections")
    assert hasattr(changelog, "preview")
    assert hasattr(changelog, "save")

    # assert that it has the desired outputting interfaces
    assert callable(changelog.preview)
    assert callable(changelog.save)

    assert (
        str(changelog.title) == f"Changelog for {release.version}"
    ), "Changelog title does not match the release version"
    assert (
        str(changelog.release_hash) == release.latest_commit_hash
    ), "Changelog release hash does not match the release's latest commit hash"

    assert (
        changelog.release_date == release.release_date
    ), "Changelog release date does not match today's date"


@pytest.mark.parametrize("release", ["3.8", "3.7.4", "3.7.5", "3.9"], indirect=True)
def test_generate_changelog_sections(release: Release):
    """
    Test the generation of changelog sections for the given release (Added, Changed, Fixed).

    Args:
        release (Release): The release object for which the changelog sections are generated.
    """
    changelog = Changelog(release)
    assert_changelog_has_proper_sections(changelog.sections)


@pytest.mark.parametrize("release", ["3.8", "3.7.4", "3.7.5", "3.9"], indirect=True)
def test_section_to_markdown(release: Release):
    """
    Test the conversion of changelog sections to markdown format.

    Args:
        release (Release): The release object containing the changelog sections.

    Returns:
        None
    """
    changelog = Changelog(release)

    for section in changelog.sections:
        assert_section_has_proper_markdown(section)


@pytest.mark.parametrize("release", ["3.8", "3.7.4", "3.7.5", "3.9"], indirect=True)
def test_changelog_simple_save(release: Release, changelog_dir: Path, capsys):
    """
    Test the saving of a changelog to a file without any previous changelogs or index.md.

    Args:
        release (Release): The release object.
        changelog_dir (Path): The directory where the changelog file will be saved.
        capsys: The pytest fixture for capturing stdout and stderr.

    Returns:
        None
    """
    expected_file_name = f"{release.version}.md"
    expected_path = changelog_dir / expected_file_name

    changelog = Changelog(release)
    changelog.save(expected_file_name, directory=changelog_dir, overwrite=False)

    assert_changelog_is_successfully_saved(changelog, expected_path)


@pytest.mark.skip(reason="Not fully implemented/supported yet")
@pytest.mark.parametrize("release", ["3.8", "3.9"], indirect=True)
def test_changelog_unreleased_separate_save(
    release: Release, git_repo: GitRepo, changelog_dir: Path, capsys
):
    """
    Test the saving of an Unreleased changelog to a file without any previous changelogs, index.md, or VDD.

    This test should result in an UNRELEASED.md file in addition to a versioned changelog corresponding to the release. The UNRELEASED.md will contain commits from the preview branch that are not in the release branch. You should see an extra file in the directory.

    Args:
        release (Release): The release object.
        git_repo (GitRepo): The Git repository object.
        changelog_dir (Path): The directory where the changelog files are saved.
        capsys: The pytest fixture for capturing stdout and stderr.

    Returns:
        None

    Notes:
        This test has somewhat moved into the test_commands.py since we use the commands.py for cli generation.
        TODO: Move this test or remove it.
    """
    branch_name = "devel"
    expected_file_name = "UNRELEASED.md"
    expected_version_file_name = f"{release.version}.md"

    expected_path = changelog_dir / expected_file_name

    changelog = Changelog(release, preview_branch=branch_name, unreleased=True)
    changelog.save(directory=changelog_dir, overwrite=True)

    assert changelog.path.name in [
        expected_file_name,
        expected_version_file_name,
    ], f"Changelog file name ({changelog.path.name}) is not one of the expected names"
    assert changelog.path.exists(), f"Changelog file does not exist: {changelog.path}"
    assert (
        expected_path.stat().st_size > 0
    ), f"Changelog file (current_path: {changelog.path}) at (expected_path: {expected_path}) is empty. "


@pytest.mark.parametrize("release", ["3.8", "3.7.4", "3.7.5", "3.9"], indirect=True)
@pytest.mark.skip(reason="Not fully implemented/supported yet")
def test_changelog_exception_raised_when_file_already_exists(
    release: Release, changelog_dir: Path
):
    """
    Test that the proper exception is raised when trying to save a changelog to a file that already exists.
    """

    expected_file_name = f"{release.version}.md"

    changelog = Changelog(release)

    with pytest.raises(ChangelogFileExistsError) as changelog_exception:
        changelog.save(expected_file_name, directory=changelog_dir)

    assert_changelog_exception_raised_on_save(changelog, changelog_exception)
