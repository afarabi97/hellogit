from datetime import datetime
from pathlib import Path
from typing import List

import pytest
from changelog.gitrepo import GitRepo, Release
from changelog.version_helper import str_to_ver
from git import Commit, Head
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


@pytest.fixture
def prefixes():
    return ["(fix)", "(feat)", "(perf)", "(sus)", "(docs)"]


def assert_root_dir_is_valid(root_dir):
    str_root_dir = str(root_dir)

    # root_dir must be an absolute path
    assert str_root_dir.startswith("/")

    # root_dir must be a directory
    assert Path(str_root_dir).is_dir()

    # root_dir must contain a .git directory
    assert Path(str_root_dir, ".git").is_dir()

    # root_dir basename must be the same as the repo name
    assert Path(str_root_dir).name == "tfplenum"


def assert_repo_is_valid(repo: GitRepo):
    assert hasattr(repo, "get_branch")
    assert hasattr(repo, "get_releases")
    assert hasattr(repo, "get_release")
    assert hasattr(repo, "get_available_versions")
    assert hasattr(repo, "latest_release")
    assert hasattr(repo, "working_dir")
    assert hasattr(repo, "repo")
    assert hasattr(repo, "project_name")
    assert callable(repo.get_release)
    assert callable(repo.get_releases)
    assert callable(repo.get_branch)


def assert_git_branch_is_valid(branch: GitRepo.GitBranch, branch_name: str):
    assert branch is not None and branch_name is not None
    assert isinstance(branch, GitRepo.GitBranch)
    assert isinstance(branch, Head)
    assert hasattr(branch, "name")
    assert hasattr(branch, "commits")
    assert hasattr(branch, "summaries")
    assert isinstance(branch.commits, set)
    assert callable(branch.get_prefixed_summaries)
    assert branch.name == branch_name


def test_get_latest_release(capsys):
    repo = GitRepo("tfplenum")
    latest_release_branch = repo.latest_release
    assert latest_release_branch.version == Version("3.9.0.0")
    assert latest_release_branch.previous_branch.version == Version("3.8.0.0")


def test_get_repo():
    """
    Test case for getting a Git repository.

    This function creates a GitRepo object for the project "tfplenum" and performs
    assertions to validate the repository and its root directory.

    """
    repo = GitRepo(project_name="tfplenum")
    assert_repo_is_valid(repo)
    assert_root_dir_is_valid(repo.working_dir)


@pytest.mark.parametrize("release_version", ["3.8", "3.9", "3.7.4"])
def test_get_release(release_version):
    """
    Test the functionality of the `get_release` method in the GitRepo class.

    Args:
        release_version (str): The version of the release to retrieve.

    Returns:
        None
    """

    repo = GitRepo(project_name="tfplenum")
    release: Release = repo.get_release(release_version)

    assert release is not None
    assert release.version == str_to_ver(release_version)
    assert isinstance(release, Release)
    assert len(release) == 2
    assert callable(release.get_unique_release_and_branch_commits)
    assert callable(release.get_commit_summaries)


@pytest.mark.parametrize("minver,expected_number_of_releases", [("3.7.3", 5)])
def test_get_all_available_versions(
    available_versions, minver, expected_number_of_releases
):
    """
    Test case for the `get_available_versions` method of the GitRepo class which returns a list of available versions based on what is in the release branches.

    Args:
        available_versions: A list of available versions.

    Raises:
        AssertionError: If any of the assertions fail.

    Notes:
        This test case is hard coded for the number of releases in the tfplenum project at the time of writing.
        This will fail when a release is removed from the project.

    TODO: Make this test case dynamic so that it can handle any number of releases.
    """
    repo = GitRepo()
    minver_version = str_to_ver(minver)

    assert hasattr(repo, "get_available_versions")
    assert callable(repo.get_available_versions)
    assert len(repo.get_available_versions()) <= len(
        available_versions
    ), "Should be less than or equal to all available versions. Forks may not have all versions."
    assert expected_number_of_releases >= len(
        repo.get_available_versions(minver=minver)
    )
    assert expected_number_of_releases >= len(repo.get_available_versions(minver))
    assert expected_number_of_releases >= len(
        repo.get_available_versions(minver_version)
    )


@pytest.mark.parametrize("from_version, to_version", [("3.7.4", "3.8"), ("3.8", "3.9")])
def test_get_releases_from_range_of_versions(from_version, to_version):
    """
    Test that we can get a release from a version string.
    """
    repo = GitRepo(project_name="tfplenum")
    releases: List[Release] = repo.get_releases(
        from_version=from_version, to_version=to_version
    )

    assert hasattr(repo, "get_releases")
    assert callable(repo.get_releases)
    assert releases, "Should be a list of releases"
    assert all(
        isinstance(release, Release) for release in releases
    ), "All items in the list should be of type Release"
    assert all(
        release.version >= str_to_ver(from_version) for release in releases
    ), "All releases should be greater than or equal to the from_version"
    assert all(
        release.version <= str_to_ver(to_version) for release in releases
    ), "All releases should be less than or equal to the to_version"
    assert releases[0].version == str_to_ver(
        from_version
    ), "The first release should be the from_version"
    assert releases[-1].version == str_to_ver(
        to_version
    ), "The last release should be the to_version"


@pytest.mark.parametrize("from_version, to_version", [("3.7.4", None), (None, "3.8")])
def test_get_releases_from_range_of_versions_blank(from_version, to_version):
    """
    Test that we can get a range of releases from a blank in either direction.
    They don't have to have a version associated with them to be valid.

    When a from version is blank, it should get the latest release.
    When a from version is not blank and the to version is blank, it should get all releases from the from version to the latest release.
    When a from version is blank and the to version is not blank, it should get all releases from the first release to the to version.
    """

    repo = GitRepo(project_name="tfplenum")
    releases: List[Release] = repo.get_releases(
        from_version=from_version, to_version=to_version
    )

    assert all(
        isinstance(release, Release) for release in releases
    ), "All items in the list should be of type Release"

    if from_version is None and to_version is None:
        assert (
            releases[0].version == repo.latest_release.version
        ), "The first release should be the latest release"
        assert (
            releases[-1].version == repo.latest_release.version
        ), "The last release should be the latest release"

    if from_version is not None and to_version is None:
        assert releases[0].version == str_to_ver(
            from_version
        ), "The first release should be the from_version"
        assert (
            releases[-1].version == repo.latest_release.version
        ), "The last release should be the latest release"

    if from_version is None and to_version is not None:
        assert releases[-1].version == str_to_ver(
            to_version
        ), "The last release should be the to_version"
        assert (
            releases[0].version == repo.get_available_versions()[1]
        ), "The first release should be the same as the first available version that has a previous version"

    if from_version is not None and to_version is not None:
        if repo.get_available_versions()[0] == str_to_ver(from_version):
            assert (
                releases[0].version == repo.get_available_versions()[1]
            ), "The first release should be the from_version if it has a previous version"
        else:
            assert releases[0].version == str_to_ver(
                from_version
            ), "The first release should be the from_version"

        assert releases[-1].version == str_to_ver(
            to_version
        ), "The last release should be the to_version"


@pytest.mark.parametrize("branch_name", ["devel", "feat/THISISCVAH-14435"])
def test_get_branch(branch_name, capsys):
    """
    Test that we can get a branch from a version string.
    """
    repo = GitRepo(project_name="tfplenum")
    branch = repo.get_branch(branch_name)
    assert_git_branch_is_valid(branch, branch_name)
    # branch.com
    for summary in branch.get_prefixed_summaries(prefixes=("(fix)")).keys():
        assert summary.startswith("(fix)")

    # assert_git_branch_filtered_commits_are_valid(filtered_commits, branch_name)


# @pytest.mark.parametrize("from_version, to_version", [('3.7.4', None), (None, '3.8')])
@pytest.mark.parametrize(
    "other_branch, version",
    [
        ("devel", "3.7.4"),
        ("feat/THISISCVAH-14435", "3.7.4"),
        ("devel", "3.8"),
        ("feat/THISISCVAH-14435", "3.8"),
        ("devel", "3.9"),
        ("feat/THISISCVAH-14435", "3.9"),
    ],
)
def test_get_unique_commits_from_branch(other_branch, version, capsys):
    """
    Test that we can get the unique commits from any given branch against a release.

    This is useful for getting the unique commits from a release branch against branches such as devel.
    """
    repo = GitRepo(project_name="tfplenum")

    release: Release = repo.get_release(version)
    release_branch = repo.get_branch(release.release_branch.name)
    other_branch = repo.get_branch(other_branch)
    unique_branch_commits: List[Commit] = other_branch.get_unique_commits(
        release_branch
    )

    assert hasattr(repo, "get_branch")
    assert unique_branch_commits, "Should be a list of commits"

    with capsys.disabled():
        print("\n")
        print("Test Name: test_get_unique_commits_from_branch")
        print("-" * 20)
        print(f"release_branch: {release_branch}")
        print(f"other_branch: {other_branch}")
        print(f"Number of unique commits: {len(unique_branch_commits)}")


@pytest.mark.parametrize(
    "regular_branch, release_version",
    [
        ("devel", "3.7.4"),
        ("feat/THISISCVAH-14435", "3.7.4"),
        ("devel", "3.8"),
        ("feat/THISISCVAH-14435", "3.8"),
        ("devel", "3.9"),
        ("feat/THISISCVAH-14435", "3.9"),
    ],
)
def test_get_unique_commits_for_release_and_branch(
    regular_branch, release_version, capsys
):
    """
    Test that we can get the unique commits from any given branch against a release and add the unique commits to the list of commits for the release.

    This is useful when you want to preview the changelog for a release against your current branch as the release branch.
    """
    repo = GitRepo(project_name="tfplenum")

    release: Release = repo.get_release(release_version)
    release_branch = repo.get_branch(release.release_branch.name)
    branch = repo.get_branch(regular_branch)
    unique_branch_commits: List[Commit] = branch.get_unique_commits(release_branch)
    unique_release_commits: List[Commit] = release.unique_commits
    expected_total_length = len(unique_branch_commits) + len(unique_release_commits)

    # Add the unique commits together and remove duplicates using set theory
    all_unique_commits = release.get_unique_release_and_branch_commits(branch)

    assert hasattr(repo, "get_branch")
    assert unique_branch_commits, "Should be a list of commits"
    assert unique_release_commits, "Should be a list of commits"
    assert all_unique_commits, "Should be a list of commits"
    assert (
        len(all_unique_commits) == expected_total_length
    ), "Should be the sum of the unique commits from the branch and the unique commits from the release"

    with capsys.disabled():
        print("\n")
        print("-" * 20)
        # print(f"Test Name: {pytest.currentTest.name}")
        print("Test Name: test_get_unique_commits_for_release_and_branch")
        print(f"release_branch: {release_branch}")
        print(f"regular_branch: {branch}")
        print(
            f"Unique commits between {release_branch} and {branch}: {len(unique_branch_commits)}"
        )
        print(
            f"Unique commits between {release_branch} and previous release {release.previous_branch}: {len(release.unique_commits)}"
        )
        print(
            f"Total Unique commits between {release_branch} and previous release {release.previous_branch} and {branch}: {len(all_unique_commits)}"
        )
        print(f"Expected total unique commits: {expected_total_length}")
