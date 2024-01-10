import contextlib
import os
from pathlib import Path
from typing import List, Optional, Self, Union
import datetime

import git
from changelog.version_helper import str_to_ver
from git import Commit, Head, Repo
from packaging.version import Version

CHANGELOG_GIT_TIMEOUT_SECONDS = float(3)


class Release:
    """
    A release comprises a prev_branch and a release_branch and their associated commits.
    """

    def __init__(self, prev_branch, release_branch):
        self._prev_branch = prev_branch
        self._release_branch: git.Head = release_branch
        self._fetch_commits()  # Must call
        self._commits = self._get_commits()
        self._unique_commits = self._get_unique_commits_between_releases()
        self._last_commit_hash = None
        self._release_date = None

    def __len__(self):
        return len([self._prev_branch, self._release_branch])

    @property
    def version(self) -> Version:
        """
        Returns the version of the release.

        NOTE: This is set in `_get_prev_and_cur_release_branches`. Normal `git.git.Head` objects DO NOT have a version attribute.
        """
        return self.release_branch.version

    @property
    def unique_commits(self) -> List[Commit]:
        """
        Returns a list of unique commits between the prev_branch and the release_branch.
        """
        return self._unique_commits

    @property
    def latest_commit_hash(self, repo: Optional[git.Repo] = None) -> str:
        """
        Returns the hash of the latest commit in the release branch.
        """
        repo = repo or self.release_branch.repo
        if self._last_commit_hash:
            return self._last_commit_hash
        self._last_commit_hash = repo.git.rev_list(self.release_branch, max_count=1)
        return self._last_commit_hash

    @property
    def release_date(self):
        """
        Returns the date of the latest commit in the release branch.
        """
        repo = self.release_branch.repo
        if not self._release_date:
            committed_datetime = repo.commit(self.latest_commit_hash).committed_datetime
            self._release_date = committed_datetime.date()
        return self._release_date
       

    @property
    def previous_version(self) -> git.Head:
        """
        Returns the previous version of the release.
        """
        return self.previous_branch.version

    @property
    def previous_branch(self) -> git.Head:
        """
        Returns the previous release branch.
        """
        return self._prev_branch

    @property
    def release_branch(self) -> git.Head:
        """
        Returns the current release branch.
        """
        return self._release_branch

    @property
    def commits(self) -> List[Commit]:
        """
        Returns a list of commits between the prev_branch and the release_branch.
        """
        return self._commits

    def get_unique_release_and_branch_commits(
        self, branch: Head, prefixes: tuple = ("(fix)", "(feat)", "(perf)", "(sus)")
    ):
        """
        Returns a list of unique commits between the prev_branch and the release_branch.
        """

        return self._get_unique_commits_between_releases(
            prefixes=prefixes, regular_branch=branch
        )

    def get_commit_summaries(self, branch: git.Head):
        """
        Get the commit summaries for a given branch.

        Args:
            branch: The branch to retrieve commit summaries from.

        Returns:
            A dictionary mapping commit summaries to their corresponding commit hashes.

        """
        if isinstance(branch, git.Head):
            repo: git.Repo = branch.repo
        else:
            repo: git.Repo = self._release_branch.repo or self._prev_branch.repo

        commits = repo.git.rev_list(branch, no_merges=True).split()
        return {repo.commit(commit).summary: commit for commit in commits}

    def _get_unique_commits_between_releases(
        self,
        repo_path: str = None,
        previous_branch: Head = None,
        release_branch: Head = None,
        prefixes: tuple = ("(fix)", "(feat)", "(perf)", "(sus)"),
        remote_name: str = "origin",
        regular_branch: Head = None,
    ):
        """
        Get the unique commits between two branches based on commit summaries.

        Args:
            repo_path: The path to the repository. If not provided, it uses the repository of the release branch or the previous branch.
            previous_branch: The previous branch to compare with. If not provided, it uses the previous branch of the instance.
            release_branch: The release branch to compare with. If not provided, it uses the release branch of the instance.
            prefixes: The prefixes to filter the commit summaries. Defaults to ('(fix)', '(feat)', '(perf)', '(sus)').
            remote_name: The name of the remote repository. Defaults to "origin".
            regular_branch: The regular branch to compare with. If not provided, skips the comparison with the regular branch.

        Returns:
            A list of filtered commits between the two branches.

        """

        if not repo_path:
            repo = self._release_branch.repo or self._prev_branch.repo

        if not previous_branch:
            previous_branch = self._prev_branch

        if not release_branch:
            release_branch = self._release_branch

        if not prefixes:
            prefixes = ("(fix)", "(feat)", "(perf)", "(sus)")

        if not remote_name:
            remote_name = "origin"

        filtered_commits: List[Commit] = []
        previous_branch_summaries = self.get_commit_summaries(previous_branch)
        release_branch_summaries = self.get_commit_summaries(release_branch)
        unfiltered_unique_summaries = set(release_branch_summaries.keys()) - set(
            previous_branch_summaries.keys()
        )

        # Filter the release branch summaries and add them to the filtered_commits list
        filtered_unique_summaries = {
            summary
            for summary in unfiltered_unique_summaries
            if summary.startswith(prefixes)
        }
        filtered_commits = [
            repo.commit(release_branch_summaries[summary])
            for summary in filtered_unique_summaries
        ]

        # If a regular branch is provided, add the commits from the regular branch that are not in the release branch
        if regular_branch:
            branch_summaries = self.get_commit_summaries(regular_branch)
            unfiltered_branch_summaries = set(branch_summaries.keys()) - set(
                release_branch_summaries.keys()
            )
            filtered_branch_summaries = {
                summary
                for summary in unfiltered_branch_summaries
                if summary.startswith(prefixes)
            }
            # Add the commits from the regular branch that are not in the release branch to the filtered_commits list
            unique_branch_commits = [
                repo.commit(branch_summaries[summary])
                for summary in filtered_branch_summaries
                if summary not in [commit.summary for commit in filtered_commits]
            ]
            filtered_commits.extend(unique_branch_commits)

        return filtered_commits

    def _fetch_commits(
        self,
        repo: Optional[git.Repo] = None,
        previous_branch: Optional[git.Head] = None,
        release_branch: Optional[git.Head] = None,
        remote_name: Optional[str] = "origin",
    ):
        """
        Fetches the commits from the release branch.
        """
        repo = repo or self.release_branch.repo
        previous_branch = previous_branch or self.previous_branch
        release_branch = release_branch or self.release_branch
        with contextlib.suppress(git.GitCommandError):
            for branch in [previous_branch, release_branch]:
                repo.git.fetch(remote_name, branch)

    def _get_commits(self):
        """
        Returns a list of commits between the prev_branch and the release_branch.
        This does not filter the commits.
        """
        return self._release_branch.commit.diff(self.previous_branch.commit)

    def __str__(self) -> str:
        """
        Returns a string representation of the Release object.
        """
        return f"Release(prev_branch={self._prev_branch}, release_branch={self._release_branch})"

    def __repr__(self) -> str:
        """
        Returns a string representation of the Release object that can be used to recreate the object.
        """
        return f"Release(prev_branch={repr(self._prev_branch)}, release_branch={repr(self._release_branch)})"


class GitRepo:
    class GitBranch(Head):
        def __init__(self, repo: Repo, branch_name: str):
            if branch_name not in repo.heads:
                raise ValueError(f"Branch {branch_name} does not exist in repo {repo}")
            super().__init__(repo, repo.heads[branch_name].path)

        @property
        def commits(self):
            return set(self.commit.iter_items(self.repo, self.commit.hexsha))

        @property
        def summaries(self):
            return {self.repo.commit(commit).summary: commit for commit in self.commits}

        def get_prefixed_summaries(
            self, prefixes: tuple = ("(fix)", "(feat)", "(perf)", "(sus)")
        ):
            return {
                self.repo.commit(commit).summary: commit
                for commit in self.commits
                if self.repo.commit(commit).summary.startswith(prefixes)
            }

        def get_unique_commits(
            self,
            other_branch: Self,
            prefixes: tuple = ("(fix)", "(feat)", "(perf)", "(sus)"),
        ):
            other_branch_summaries = other_branch.get_prefixed_summaries(prefixes)
            branch_summaries = self.get_prefixed_summaries(prefixes)
            unique_summaries = set(self.get_prefixed_summaries(prefixes).keys()) - set(
                other_branch_summaries.keys()
            )
            filtered_commits: List[Commit] = []
            for summary in unique_summaries:
                if summary.startswith(prefixes):
                    commit_hash = branch_summaries[summary]
                    filtered_commits.append(self.repo.commit(commit_hash))
            return filtered_commits

            # return self.commits - other_branch.commits

    def __init__(self, project_name: str = "tfplenum", repo_path: Optional[str] = None):
        self._release_branches = None
        self._project_name = project_name
        self._repo_path = repo_path
        self._repo = self._get_repo()

    def get_branch(self, branch_name: str) -> GitBranch:
        """
        Returns a GitBranch object for the given branch_name.
        """
        return self.GitBranch(self._repo, branch_name)

    def get_release(self, release_version: Union[str, Version]) -> Release:
        """
        Returns a Release object for the given release_version.
        """
        mrelease_version = (
            str_to_ver(release_version)
            if isinstance(release_version, str)
            else release_version
        )
        previous_branch, current_branch = self._get_prev_and_cur_release_branches(
            mrelease_version
        )
        return Release(previous_branch, current_branch)

    def _get_repo(
        self, repo_path: Optional[str] = None, project_name: Optional[str] = None
    ) -> Repo:
        """
        Returns a gitpython Repo object.

        side effects: sets self._repo_path and self._repo
        """
        project_name = project_name or self._project_name
        if project_name is None:
            raise ValueError(
                "project_name must be provided if it is not set in the constructor."
            )

        # Repo Path Operations
        repo_path = (
            repo_path or self._repo_path if self._repo_path is not None else os.getcwd()
        )
        if not os.path.isabs(repo_path):
            repo_path = os.path.abspath(repo_path)
        self._repo_path = repo_path

        # Verify that the repo_path is a git repo
        repo = Repo(repo_path, search_parent_directories=True)
        project_dir = (
            Path(repo.working_dir)
            if Path(repo.working_dir).stem == self._project_name
            else None
        )

        if project_dir is None:
            raise ValueError(
                f"Git directory {repo.working_dir} is not the expected project {self.project_name}."
            )
        return repo

    def _get_prev_and_cur_release_branches(
        self, version: Version
    ) -> (git.Head, git.Head):
        """

        Takes the version of a release branch and returns both the previous release branch and the current release branch.

        :param version: The version of the release branch / the current version.

        :return: A tuple of the previous and current release branches.
        """
        previous_version = max(
            b.version for b in self.release_branches if b.version < version
        )
        branch_mapping = {branch.version: branch for branch in self.release_branches}
        previous_version_branch = branch_mapping[previous_version]
        current_version_branch = branch_mapping[version]
        return previous_version_branch, current_version_branch

    @property
    def project_name(self) -> str:
        """
        Returns the name of the project.
        """
        return self._project_name

    @property
    def repo(self) -> Repo:
        """
        Returns the gitpython Repo object.
        """
        return self._repo

    @property
    def working_dir(self) -> str:
        """
        Returns the working directory of the repository.
        """
        return self.repo.working_dir

    @property
    def release_branches(self) -> List[git.Head]:
        """
        Returns a list of release branches.
        Must be followed by numeric version.
        """

        if self._release_branches is not None:
            return self._release_branches

        tmp_release_branches = [
            branch
            for branch in self.repo.branches
            if branch.name.startswith("release/")
        ]

        release_branches = []
        for branch in tmp_release_branches:
            branch_version = str_to_ver(branch.name.split("/")[1])
            if branch_version is not None:
                branch.version: Version = branch_version
                branch.commits = set(
                    branch.commit.iter_items(self._repo, branch.commit.hexsha)
                )
                release_branches.append(branch)
        self._release_branches = sorted(
            release_branches, key=lambda branch: branch.version
        )
        return self._release_branches

    @property
    def latest_release(self) -> Release:
        if not self.release_branches:
            return None
        return self.get_release(self.release_branches[-1].version)

    @property
    def current_branch(self):
        return self.get_branch(self.repo.active_branch.name)

    def get_available_versions(self, minver: Optional[Union[str, Version]] = None):
        """
        Returns a list of available versions.
        """
        minver = str_to_ver(minver) if isinstance(minver, str) else minver
        available_versions: List[Version] = (
            [
                branch.version
                for branch in self.release_branches[1:]
                if branch.version >= minver
            ]
            if minver
            else [branch.version for branch in self.release_branches]
        )

        return available_versions

    def get_releases(
        self,
        from_version: Optional[Union[str, Version]] = None,
        to_version: Optional[Union[str, Version]] = None,
    ):
        """
        Returns a list of releases between two versions.
        """

        # Convert to Version objects if they are strings
        from_version = (
            str_to_ver(from_version) if isinstance(from_version, str) else from_version
        )
        to_version = (
            str_to_ver(to_version) if isinstance(to_version, str) else to_version
        )

        # If from version is less than or equal to the lowest available version, use the lowest available version
        if (
            from_version is not None
            and from_version <= self.get_available_versions()[0]
        ):
            from_version = self.get_available_versions()[0]

        # If no versions are specified, use the latest release
        if all(version is None for version in [from_version, to_version]):
            from_version = self.get_available_versions()[0].version
            to_version = self.latest_release.version

        # If only a to_version is specified, use the earliest release that has a previous version as  the from_version
        elif from_version is None and to_version is not None:
            from_version = self.release_branches[1].version

        # If only a from_version is specified, use the latest release for the to_version
        elif from_version is not None and to_version is None:
            from_version = self.get_available_versions(minver=from_version)[0]
            to_version = self.latest_release.version

        return [
            self.get_release(branch.version)
            for branch in self.release_branches
            if from_version <= branch.version <= to_version
        ]
