from pathlib import Path
from typing import List, Optional

import snakemd
from changelog.version_helper import str_to_ver
from packaging.version import Version


class ChangelogDirectoryError(Exception):
    pass


class TableOfContents:
    _TOC_TITLE = "CVA/H Changelog Table of Contents"
    _TOC_SUBTITLE = "This document contains a high-level overview of all changes made to the system."
    _TOC_VERSION_HEADER = "System Versions"
    _TOC_PATTERN = "*.md"
    _TOC_UNRELEASED = "UNRELEASED"

    class MDTableOfContentsDocument(snakemd.Document):
        def __init__(
            self,
            title: str,
            subtitle: str,
            version_header: str,
            versions: List[Version],
            unreleased_file: Optional[Path] = None,
        ):
            super().__init__([])

            self._title = title
            self._subtitle = subtitle
            self._version_header = version_header
            self._versions = versions
            self._unreleased_file = unreleased_file

            self.add_block(snakemd.Heading(self.title, level=1))
            self.add_block(snakemd.Quote(self.subtitle))
            self.add_block(snakemd.Heading(self.version_header, level=2))
            self.add_block(self._get_mardown_version_list(unreleased_file))

        def _get_mardown_version_list(self, unreleased_file: Optional[Path] = None):
            changelog_list = [
                snakemd.Heading(
                    snakemd.Inline(f"{str(version)}", link=f"./{version}.md"), level=3
                )
                for version in self.versions
            ]
            if unreleased_file:
                unreleased_filename = unreleased_file.name
                unreleased_file_display_name = unreleased_file.stem
                unreleased_link = snakemd.Heading(
                    snakemd.Inline(
                        f"{unreleased_file_display_name}",
                        link=f"./{unreleased_filename}",
                    ),
                    level=3,
                )
                changelog_list.insert(0, unreleased_link)
            return snakemd.MDList(changelog_list)

        @property
        def title(self):
            return self._title

        @property
        def subtitle(self):
            return self._subtitle

        @property
        def version_header(self):
            return self._version_header

        @property
        def versions(self):
            return sorted(self._versions, reverse=True) if self._versions else []

    # @property
    # def versions_length(self):
    #     return len(self.versions) if self._versions else 0

    def __init__(
        self,
        changelog_directory: Optional[Path] = None,
        changelog_search_pattern: Optional[str] = _TOC_PATTERN,
        title: Optional[str] = None,
        subtitle: Optional[str] = None,
        version_header: Optional[str] = None,
    ):
        self._directory = changelog_directory
        self._search_pattern = changelog_search_pattern or self._TOC_PATTERN
        self._title = title or self._TOC_TITLE
        self._subtitle = subtitle or self._TOC_SUBTITLE
        self._version_header = version_header or self._TOC_VERSION_HEADER
        self._versions = (
            self._parse_directory_for_versions(self.directory)
            if self.directory
            else None
        )
        self._versions = sorted(self._versions, reverse=True) if self._versions else []

    @property
    def title(self):
        return self._title

    @property
    def subtitle(self):
        return self._subtitle

    @property
    def version_header(self):
        return self._version_header

    @property
    def directory(self):
        if not self._directory:
            return None
        if not self._directory.exists() and not self._directory.is_dir():
            return None
        return self._directory

    def list_dir(self, search_pattern: Optional[str] = None):
        search_pattern = search_pattern or self.search_pattern
        return list(self.directory.glob(search_pattern)) if self.directory else None

    @property
    def unreleased_file_path(self) -> Optional[Path]:
        unreleased_file_name = f"{self._TOC_UNRELEASED}.md"
        unreleased_path = self.directory / unreleased_file_name
        return (
            unreleased_path
            if unreleased_path.exists() and unreleased_path.is_file()
            else None
        )

    @property
    def document(self):
        if not any(
            [self.versions, self.title, self.subtitle, self.directory, self.path]
        ):
            return None
        sorted_versions = sorted(self.versions, reverse=True) if self.versions else []
        return self.MDTableOfContentsDocument(
            self.title,
            self.subtitle,
            self.version_header,
            sorted_versions,
            self.unreleased_file_path,
        )

    @property
    def search_pattern(self):
        return self._search_pattern

    @property
    def path(self):
        return self.directory / "index.md" if self.directory else None

    @property
    def versions(self):
        versions = (
            self._versions or self._parse_directory_for_versions(self.directory)
            if self.directory
            else []
        )
        return sorted(versions, reverse=True) if versions else []

    def _parse_directory_for_versions(self, changelog_dir: Path) -> List[Version]:
        changelog_dir = changelog_dir or self.directory
        if (
            not changelog_dir
            or not changelog_dir.exists()
            or not changelog_dir.is_dir()
        ):
            return None
        return [
            str_to_ver(path.stem)
            for path in changelog_dir.iterdir()
            if path.suffix == ".md" and path.is_file() and (str_to_ver(path.stem))
        ]

    def _sort_paths_by_version(self, paths: List[Path]) -> List[Path]:
        return sorted(paths, key=lambda x: x.name, reverse=True)

    def save(self, changelog_directory: Optional[Path] = None):
        if not changelog_directory and not self.directory:
            raise ChangelogDirectoryError("No changelog directory provided.")

        if not changelog_directory:
            changelog_directory = self.directory
            self._versions = self._parse_directory_for_versions(changelog_directory)

        # ensure it exists
        changelog_directory.mkdir(parents=True, exist_ok=True)

        # create index.md
        self.path.write_text(str(self.document))
