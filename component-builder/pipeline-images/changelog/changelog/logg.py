import re
import tempfile
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Union

import git
import snakemd
from changelog.gitrepo import GitRepo, Release
from changelog.version_helper import increment_micro
from snakemd import Block

"""
The architectuere of this module is as follows:
    - A Changelog is a log for a single release. It is  composed of a Title, Release Date, Release Hash, and Sections.
    - A Section is a section of the changelog that commits of certain types fall into. It is composed of a title and commits which are served as markdown commits on the fly.
        - There are currently three types of sections: Added, Fixed, and Changed.
    - A MDCommit is a commit that has been parsed from a releases commit for conversion into markdown.
        - It is composed of a Title, Ticket, Author, and Body that are used to form the Detail.... almost done I promise :)
    - A Detail is a markdown Block that is a full representation of a full commit that lives within a given Section.
    - The SectionFactory makes sections in the order and form of Added, Fixed, and Changed. Pass it a list of commits and it will return a list of sections.
    - The Changelog class is the main entry point for this module. It is responsible for creating the changelog document and saving it to disk.
Note:
    Most of the important concepts that are static have been turned into value objects that are string and iterable friendly.
    These value objects are either encapsulated in the classes that use them or are used directly due to ease of use,
    my laziness or hesitance to rewrite code that passes tests.
"""


class MDCommit:
    """
    Markdown commit. This is a commit that has been parsed from a releases commit.

    This served two roles for me. I wanted to be able to parse the commit into its component parts,
    and I wanted to be able to convert the commit into markdown.
    """

    # ---------------------------------------------------------------------------- #
    #                             ENCAPSULATED CLASSES                             #
    # ---------------------------------------------------------------------------- #

    class Ticket:
        def __init__(self, ticket_prefix: str, ticket_number: str):
            self._ticket_prefix = (
                ticket_prefix.upper()
                if ticket_prefix.upper() in {"THISISCVAH", "AFDCO"}
                else None
            )
            self._ticket_number = (
                ticket_number
                if ticket_number.isdigit() and (5 <= len(ticket_number) <= 6)
                else None
            )
            self._ticket_link = (
                f"https://jira.levelup.cce.af.mil/browse/{ticket_prefix}-{ticket_number}"
                if self._ticket_prefix and self._ticket_number
                else None
            )
            self._ticket_text = f"#{ticket_number}" if self._ticket_number else None

        @property
        def link(self):
            return self._ticket_link

        @property
        def link_text(self):
            return self._ticket_text

        def __str__(self):
            return f"{self._ticket_prefix}-{self._ticket_number}"

        def __repr__(self):
            return self.__str__()

    class CommitTitle:
        def __init__(self, title: str):
            self._title = title.capitalize()

        def __str__(self):
            return self._title

        def __repr__(self):
            return self.__str__()

    class CommitAuthor:
        def __init__(self, author: git.Actor):
            self.name = author.name.replace(" ", ".").lower()
            self.email = author.email
            self.contact_link = f"mailto:{self.email}"
            self.contact_text = f"@{self.name.lower()}"

        def __str__(self):
            return self.name

        def __repr__(self):
            return self.__str__()

    class CommitBody:
        def __init__(self, body: str):
            self._raw_body: List[str] = body
            self._body: List[str] = self._parse_body(body)

        def _parse_body(self, body: Union[List[str], str]) -> List[str]:
            """
            Parse the commit body into its component parts.
            """
            body = body or self._raw_body
            return [
                line.strip()
                for line in body.splitlines()
                if line and line.startswith("- ")
            ]

        @property
        def body(self):
            return self._body

        def __iter__(self):
            self.index = 0
            return self

        def __next__(self):
            if self.index >= len(self.body):
                raise StopIteration
            line = self.body[self.index]
            self.index += 1
            return line

        def __str__(self):
            return self.body

        def __repr__(self):
            return self.__str__()

    # ---------------------------------------------------------------------------- #
    #                                PUBLIC METHODS                                #
    # ---------------------------------------------------------------------------- #

    def __init__(self, commit: git.Commit):
        self._commit = commit
        self._title = None
        self._ticket = None
        self._author = None
        self._body = None
        self._detail = None
        self._parse_commit(commit)

    # ---------------------------------------------------------------------------- #
    #                                PRIVATE METHODS                               #
    # ---------------------------------------------------------------------------- #

    def _set_commit_ticket_title(
        self, commit_summary: Optional[Union[str, bytes]] = None
    ) -> (CommitTitle, Ticket):
        """
        Parse the commit summary into its component parts.

        Side effects:
            - sets self._title
            - sets self._ticket
        """

        # match = re.match(r"\((.*?)\) (.*?): (.*?)$", commit_summary)
        match = re.match(r"\(.*?\) (.*?)-(\d+): (.*)$", commit_summary)

        if match and len(match.groups()) == 3:
            self._ticket = self.Ticket(str(match[1]), str(match[2]))
            self._title = self.CommitTitle(match[3])
        return self._title, self._ticket

    def _set_commit_author(self, actor: git.Actor) -> CommitAuthor:
        """
        Parse the commit body into its component parts.

        Side effects:
            - sets self._author
        """
        self._author = self.CommitAuthor(actor)
        return self._author

    def _parse_commit(self, commit: Optional[git.Commit] = None):
        """
        Parse the commit into its component parts.
        """
        commit = commit or self._commit

        # Get the ticket prefix, number, and title from the commit summary for a commit that looks like this: (feat) AFDCO-13943: Dell 6515 Software RAID change
        self._set_commit_ticket_title(commit.summary)

        # Get the Commit author info from the commit body for a commit that looks like this:
        self._set_commit_author(commit.author)

        # Get the commit body lines
        self._body = self.CommitBody(commit.message)

    def __str__(self):
        return str(self.detail)

    def __repr__(self):
        return self.__str__()

    # ---------------------------------------------------------------------------- #
    #                                  PROPERTIES                                  #
    # ---------------------------------------------------------------------------- #

    @property
    def detail(self):
        return (
            self._detail or Detail(self.title, self.ticket, self.author, self.body)
            if self.title and self.ticket and self.author and self.body
            else None
        )

    @property
    def title(self):
        return self._title

    @property
    def ticket(self):
        return self._ticket

    @property
    def author(self):
        return self._author

    @property
    def body(self):
        return self._body


class Detail(Block):
    """
    Markdown detail block. This is a detail that has been parsed from a markdown snakemd.

    <details>
        <summary>Update sffv2 v3.8 script generator
            <a href=" https://jira.levelup.cce.af.mil/browse/THISISCVAH-14166">
                #14166
            </a>
            <a href="mailto:maurice.nash@sil.lab">
                @maurice.nash
            </a>
        </summary>

        - Created SSFv2 base and auxiliary switch templates
        - Cleanup of previous templates from SFFv1
        - Updated DIP config generator for SSFv2 based on new templates
        - Completed user stories THISISCVAH-14166, THISISCVAH-14280, and THISISCVAH-14290
    </details>
    """

    def __init__(self, title, ticket, author, body):
        self._title = title
        self._ticket = ticket
        self._author = author
        self._body = ""
        for line in body:
            self._body += f"\t{line}\n"

        self._detail = f'<details>\n\t<summary>{self._title}\n\t\t<a href="{self._ticket.link}">{self._ticket.link_text}</a>\n\t\t<a href="{self._author.contact_link}">{self._author.contact_text}</a>\n\t</summary>\n\n{self._body}</details>'

    def __str__(self):
        return self._detail

    def __repr__(self):
        return self.__str__()


class Section:
    # ---------------------------------------------------------------------------- #
    #                                PUBLIC METHODS                                #
    # ---------------------------------------------------------------------------- #

    def __init__(self, title: str, commits: List[git.Commit], commit_prefix: str):
        self._title = title
        self._commit_prefix = (
            commit_prefix
            if commit_prefix.startswith("(") and commit_prefix.endswith(")")
            else f"({commit_prefix})"
        )
        self._commits = self._filter_commits(commits)

    # ---------------------------------------------------------------------------- #
    #                                PRIVATE METHODS                               #
    # ---------------------------------------------------------------------------- #

    def _filter_commits(
        self, commits: List[git.Commit], commit_prefix: Optional[str] = None
    ) -> List[git.Commit]:
        """
        Filter out commits that do not have a proper prefix.
        """
        commits = commits or self.commits
        commit_prefix = commit_prefix or self.commit_prefix
        return [
            commit for commit in commits if commit.summary.startswith(commit_prefix)
        ]

    # ---------------------------------------------------------------------------- #
    #                                  PROPERTIES                                  #
    # ---------------------------------------------------------------------------- #

    @property
    def commit_prefix(self):
        return self._commit_prefix

    @property
    def title(self):
        return self._title.capitalize()

    @property
    def markdown_title(self):
        return snakemd.Heading(self.title, 2)

    @property
    def commits(self) -> List[git.Commit]:
        return self._commits

    @property
    def markdown_commits(self) -> List[MDCommit]:
        return [MDCommit(commit) for commit in self._commits]


# ---------------------------------------------------------------------------- #
#                               CONCRETE CLASSES                               #
# ---------------------------------------------------------------------------- #


class AddedSection(Section):
    def __init__(self, commits: List[git.Commit]):
        super().__init__("Added", commits, "(feat)")


class FixedSection(Section):
    def __init__(self, commits: List[git.Commit]):
        super().__init__("Fixed", commits, "(fix)")


class ChangedSection(Section):
    def __init__(self, commits: List[git.Commit]):
        super().__init__("Changed", commits, "(sus)")


# ---------------------------------------------------------------------------- #
#                                 VALUE OBJECTS                                #
# ---------------------------------------------------------------------------- #


class ChangeLogTitle:
    TITLE_PREFIX = "Changelog for"

    def __init__(self, version: str, from_branch: Optional[GitRepo] = None):
        self.version = version
        self.from_branch = from_branch
        self._title = (
            f"{self.TITLE_PREFIX} Unreleased {version}"
            if self.from_branch
            else f"{self.TITLE_PREFIX} {self.version}"
        )

    def __str__(self):
        return str(self._title)

    def __repr__(self):
        return self.__str__()

    def __iter__(self):
        self.index = 0
        return self

    def __next__(self):
        if self.index >= len(self._title):
            raise StopIteration
        char = self._title[self.index]
        self.index += 1
        return char

    @property
    def title(self):
        return self._title


class ChangeLogReleaseHash:
    def __init__(self, release_hash: str):
        self._release_hash = release_hash

    def __str__(self):
        return self._release_hash

    @property
    def release_hash(self):
        return self._release_hash


# ---------------------------------------------------------------------------- #
#                                   FACTORIES                                  #
# ---------------------------------------------------------------------------- #


class SectionFactory:
    @staticmethod
    def make_sections(commits: List[git.Commit]) -> List[Section]:
        """
        Factory method for creating sections that correspond to the commit type
        (e.g. "Added", "Fixed", "Changed").
        """
        return [
            section
            for section in [
                AddedSection(commits),
                FixedSection(commits),
                ChangedSection(commits),
            ]
            if section.commits
        ]


# ---------------------------------------------------------------------------- #
#                                MAIN COMPONENT                                #
# ---------------------------------------------------------------------------- #

# ---------------------------------------------------------------------------- #
#                                  EXCEPTIONS                                  #
# ---------------------------------------------------------------------------- #


class ChangelogFileExistsError(Exception):
    def __init__(self, changelog_release_version):
        message = f"Changelog file for {changelog_release_version} already exists!"
        super().__init__(message)


# ---------------------------------------------------------------------------- #
#                                    CLASSES                                   #
# ---------------------------------------------------------------------------- #


class Changelog:
    # ---------------------------------------------------------------------------- #
    #                             ENCAPSULATED CLASSES                             #
    # ---------------------------------------------------------------------------- #

    class ChangelogDoc(snakemd.Document):
        """
        A snakemd document for the changelog.
        """

        def __init__(
            self,
            title: ChangeLogTitle,
            release_date: datetime,
            release_hash: ChangeLogReleaseHash,
            sections: List[Section],
        ):
            super().__init__([])
            self.title_element = None
            self.title_spacer_element = None
            self.subtitle_release_date_element = None
            self.subtitle_release_hash_element = None
            self.subtitle_spacer_element = None
            self.sections = sections

            # Warning: These have side effects
            self._add_release_title(title)
            self._add_release_info(release_date, release_hash)
            self._add_sections(sections)

        def _add_release_title(self, title: ChangeLogTitle):
            self.title_element = snakemd.Heading(title, level=1)
            self.title_spacer_element = snakemd.Raw("\n")

            self.add_block(self.title_element)
            self.add_block(self.title_spacer_element)
            if title.from_branch:
                self.add_quote(
                    f"**NOTE:** This changelog uses branch {title.from_branch.name} which may not be complete.\n{title.from_branch.name} branch is not merged into {title.version} yet. Possible version number could be {increment_micro(title.version)}"
                )
                # self.add_block(snakemd.(f"{title.from_branch.name} branch is not merged into {title.version} yet. Possible version number could be {increment_micro(title.version)}"))

        def _add_release_info(
            self, release_date: datetime, release_hash: ChangeLogReleaseHash
        ):
            self.subtitle_release_date_element = snakemd.Inline(
                f"Release Date: {release_date}"
            )
            self.subtitle_release_hash_element = snakemd.Inline(
                f"Release Hash: {release_hash}"
            )
            self.subtitle_spacer_element = snakemd.Raw("\n")

            self.add_block(self.subtitle_release_date_element)
            self.add_block(self.subtitle_release_hash_element)
            self.add_block(self.subtitle_spacer_element)

        def _add_sections(self, sections: List[Section]):
            for section in sections:
                self.add_block(section.markdown_title)
                self.add_block(snakemd.Raw("\n"))
                for commit in section.markdown_commits:
                    self.add_block(commit.detail)
                    self.add_block(snakemd.Raw("\n"))

    # ---------------------------------------------------------------------------- #
    #                                PUBLIC METHODS                                #
    # ---------------------------------------------------------------------------- #

    def __init__(
        self,
        release: Release,
        output_dir: str = None,
        filename: str = None,
        preview_branch: GitRepo.GitBranch = None,
        unreleased: bool = False,
    ):
        self._document: self.ChangelogDoc = None
        self._release: Release = release
        self._release_date = release.release_date
        self._title = ChangeLogTitle(release.version)
        self._preview_branch = preview_branch
        self._unreleased = unreleased
        self._release_hash = ChangeLogReleaseHash(release.latest_commit_hash)
        self._sections = self._make_sections(release.unique_commits)
        self._full_path = self._make_path(output_dir, filename, release.version)

    def save(self, filename="", directory="", overwrite=False):
        """
        Save the changelog to a file.

        Args:
            filename (str, optional): The name of the file to save the changelog to. If not provided, the original filename will be used. Defaults to "".
            directory (str, optional): The directory to save the changelog file in. If not provided, the parent directory of the original file will be used. Defaults to "".
            overwrite (bool, optional): Whether to overwrite the existing file if it already exists. Defaults to False.
        """
        directory = Path(directory) if directory else self._full_path.parent
        full_path = directory / (filename or self._full_path.name)
        directory.mkdir(parents=True, exist_ok=True)

        if not full_path.exists() or overwrite:
            self._full_path = full_path
            if self.document:
                self._full_path.write_text(str(self.document))
            else:
                print("No document found.")

    def preview(self):
        # Preview the changelog by printing it to the console, if it exists
        print(self.document) if self.document else print("No document found.")

    # ---------------------------------------------------------------------------- #
    #                                PRIVATE METHODS                               #
    # ---------------------------------------------------------------------------- #
    def _make_path(self, output_dir: str, filename: str, version: str) -> Path:
        od = Path(output_dir) if output_dir else Path(tempfile.mkdtemp())
        fn = Path(filename) if filename else Path(f"{version}.md")
        return od / fn

    def _make_sections(self, commits: Optional[List] = None) -> List[Section]:
        commits = commits or self.commits
        if not commits:
            raise ValueError("No commits found for this release.")
        # Factory pattern for creating sections that correspond to the commit type
        # (e.g. "Added", "Fixed", "Changed")
        return SectionFactory.make_sections(commits)

    # ---------------------------------------------------------------------------- #
    #                                  PROPERTIES                                  #
    # ---------------------------------------------------------------------------- #

    @property
    def document(self):
        return self._document or (
            self.ChangelogDoc(
                self.title, self.release_date, self.release_hash, self.sections
            )
            if self.title and self.release_date and self.release_hash and self.sections
            else None
        )

    @property
    def preview_branch(self):
        return self._preview_branch

    @property
    def unreleased(self):
        return self._unreleased

    @property
    def title(self) -> ChangeLogTitle:
        return self._title

    @property
    def directory(self):
        return self._full_path.parent

    @property
    def path(self):
        return self._full_path

    @property
    def commits(self):
        if self.preview_branch and not self.unreleased:
            self._release.get_unique_release_and_branch_commits(self.preview_branch)
        return self._release.unique_commits

    @property
    def release_hash(self):
        return self._release_hash

    @property
    def sections(self) -> List[Section]:
        return self._sections

    @property
    def release_date(self):
        return self._release_date

    @property
    def release_version(self):
        return self._release.version
