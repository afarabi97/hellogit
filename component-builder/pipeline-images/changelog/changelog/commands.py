import tempfile
from pathlib import Path
from typing import List

from changelog.gitrepo import CHANGELOG_GIT_TIMEOUT_SECONDS, GitRepo, Release
from changelog.logg import Changelog, ChangeLogTitle
from changelog.toc import TableOfContents
from changelog.version_helper import str_to_ver
from packaging.version import Version
import markdown


class Command:
    repo: GitRepo = GitRepo()
    available_versions: List[Version] = repo.get_available_versions()
    verbose: bool = False

    def __init__(self, verbose: bool = False):
        self.verbose = verbose

    def execute(self):
        raise NotImplementedError("Subclasses must implement execute()")


class CommandResult:
    def __init__(self, cmd_name: str, *args, **kwargs):
        self.cmd_name = cmd_name
        self.input_args = kwargs

    def set_result(self, code: int, message: str):
        self.result_code = code
        self.result_message = message

    def __repr__(self):
        return self.__str__()

    def __str__(self):
        input_key_value_string = "\n\t".join(
            [f"{k}: {v}" for k, v in self.input_args.items()]
        )

        return f"Command: {self.cmd_name}\nResult Code: {self.result_code}\n\nInputs: \n\t{input_key_value_string}\n\nResult Message:\n\n{self.result_message}"


class GenerateReleaseCommand(Command):
    def __init__(
        self, from_version: str, to_version: str, output_dir: str, verbose: bool = False
    ):
        super().__init__(verbose=verbose)
        self.from_version = from_version
        self.to_version = to_version
        self.output_dir = output_dir
        self.command_result = CommandResult(
            self.__class__.__name__,
            from_version=from_version,
            to_version=to_version,
            output_dir=output_dir,
        )

    def execute(self) -> CommandResult:
        _result_message = ""
        _result_code = 0
        # Logic for generating a release

        output_dir = (
            Path(self.output_dir) if self.output_dir else Path(tempfile.mkdtemp())
        )
        _result_message = f"\tOutput Directory: {output_dir}\n\t"

        to_version = (
            str_to_ver(self.to_version)
            if self.to_version
            else self.repo.latest_release.version
        )
        _result_message += f"To Release Version: {to_version}\n\t"

        from_version = (
            str_to_ver(self.from_version) if self.from_version else to_version
        )
        _result_message += f"From Release Version: {from_version}\n\t"

        releases = self.repo.get_releases(from_version, to_version)
        _result_message += f"Releases: {releases}\n\t"

        changelogs = [Changelog(release, output_dir) for release in releases]
        _result_message += f"Number of Changelogs Created: {len(changelogs)}\n\t"

        for changelog in changelogs:
            changelog.save()
            _result_message += f"Changelog (TItle): {changelog.title}\n\t"
            _result_message += f"Changelog Path: {changelog.path}\n\t"

        toc = TableOfContents(output_dir)
        toc.save()

        _result_message += (
            f"Number of Versions in Table of Contents: {len(toc.versions)}\n\t"
        )
        _result_message += f"Table of Contents Path: {toc.path}\n\t"
        _result_message += f"Table of Contents Versions: {toc.versions}\n\n"

        self.command_result.set_result(_result_code, _result_message)
        return self.command_result


class GenerateUnreleasedCommand(Command):
    def __init__(
        self,
        from_branch,
        against_version,
        output_dir: str,
        use_release_name: bool = False,
        verbose: bool = False,
    ):
        super().__init__(verbose=verbose)
        self.from_branch = from_branch or self.repo.current_branch.name
        self.against_version = against_version or self.repo.latest_release.version
        self.use_release_name = use_release_name
        self.output_dir = output_dir
        self.command_result = CommandResult(
            self.__class__.__name__,
            from_branch=from_branch,
            against_version=against_version,
            use_release_name=use_release_name,
            output_dir=output_dir,
        )

    def execute(self) -> CommandResult:
        # SHould only update the UNRELEASED.md file and the index.md file
        _result_message = ""
        _result_code = 0
        # Logic for generating unreleased

        output_dir = (
            Path(self.output_dir) if self.output_dir else Path(tempfile.mkdtemp())
        )
        _result_message = f"\tOutput Directory: {output_dir}\n\t"

        # changelog generate unrelease --from-branch 'devel' --against-version '3.8' --output-directory 'temp'
        release = self.repo.get_release(self.against_version)

        preview_branch = self.repo.get_branch(self.from_branch)
        _result_message += f"Unreleased (Preview) Branch: {preview_branch}\n\t"

        # changelog = Changelog(release, preview_branch, output_dir)

        # Create changelog for the unreleased commits
        changelog = Changelog(
            release,
            output_dir=output_dir,
            filename="UNRELEASED.md",
            preview_branch=preview_branch,
        )
        changelog._title = ChangeLogTitle(release.version, preview_branch)
        changelog._sections = changelog._make_sections(
            release.get_unique_release_and_branch_commits(preview_branch)
        )
        changelog._full_path = changelog._make_path(
            output_dir, "UNRELEASED.md", release.version
        )
        changelog.save(overwrite=True)

        _result_message += f"Changelog (TItle): {changelog.title}\n\t"
        _result_message += f"Changelog Path: {changelog.path}\n\t"

        toc = TableOfContents(output_dir)
        toc.save()

        _result_message += (
            f"Number of Versions in Table of Contents: {len(toc.versions)}\n\t"
        )
        _result_message += f"Table of Contents Path: {toc.path}\n\t"
        _result_message += f"Table of Contents Versions: {toc.versions}\n\n"

        self.command_result.set_result(_result_code, _result_message)
        return self.command_result

class MarkdownDirectoryToHTML(Command):

    def __init__(self, input_dir: str, output_dir: str, verbose: bool = False):
        super().__init__(verbose=verbose)
        self.input_markdown_dir = input_dir
        self.output_html_dir = output_dir
        self.command_result = CommandResult(
            self.__class__.__name__,
            input_markdown_dir=input_dir,
            output_html_dir=output_dir,
        )

    def execute(self) -> CommandResult:
        # sourcery skip: extract-duplicate-method, simplify-len-comparison
        _result_message = ""
        _result_code = 0
        index_html_file_path: Path = None
        index_html_links_holder = []


        # Logic for transforming the directory of markdown files to html

        # 1. Create the markdown and html directory path variables
        input_md_dir_path = Path(self.input_markdown_dir)
        output_html_dir_path = Path(self.output_html_dir)



        # 2. Make sure the self.input_markdown_dir actually exists
        if not input_md_dir_path.exists():
            _result_message = f"Input Markdown Directory does not exist: {self.input_markdown_dir}"
            _result_code = 1
            self.command_result.set_result(_result_code, _result_message)
            return self.command_result

        # 3. Get all md files from the input_md_dir_path
        md_files = list(input_md_dir_path.glob("*.md"))

        # 4. Ensure we have markdown files to convert
        if len(md_files) == 0:
            _result_message = f"Input Markdown Directory does not contain any markdown files: {self.input_markdown_dir}"
            _result_code = 1
            self.command_result.set_result(_result_code, _result_message)
            return self.command_result

        # 5. Ensure the output_html_dir_path is made
        output_html_dir_path.mkdir(parents=True, exist_ok=True)

        # 6. Loop over the list of md_files
        for md_file in md_files:
            html_file_leaf = f"{md_file.stem}.html"
            html_file_path = output_html_dir_path / f"{html_file_leaf}"

            if md_file.name == 'index.md':
                index_html_file_path = html_file_path
            else:
                index_html_links_holder.append(md_file)


            # Create the full path to the html_file using the md_file name
            # Store the contents of the md_file as a string
            md_file_str: str = md_file.read_text()

            # 6b. Convert the md_file_str into an html_file_string
            html_file_str: str = markdown.markdown(md_file_str)

            # 6c. Write the html_file_string to the html_file
            with open(html_file_path, 'w') as html_file:
                html_file.write(html_file_str)

        # 7. If index.md is in md_files then  replace the md links with htlm links in index.html so it points to html and not markdown
        if index_html_file_path:
            index_html_file_str: str = index_html_file_path.read_text()
            for link in index_html_links_holder:
                index_html_file_str = index_html_file_str.replace(f"./{link.name}", f"./{link.stem}.html")

            with open(index_html_file_path, 'w') as index_html_file:
                index_html_file.write(index_html_file_str)

        # Successfully saved
        _result_message += f"Number of Markdown Files Converted: {len(md_files)}\n\t"
        _result_message += f"HTML Files Directory: {output_html_dir_path}\n\t"
        self.command_result.set_result(_result_code, _result_message)

        return self.command_result

class Preview(Command):
    def execute(self):
        # You want to
        # Logic for previewing changes
        pass


class Update(Command):
    def execute(self):
        # Logic for updating the changelog
        pass


class Version(Command):
    def execute(self):
        # Logic for displaying the current version
        pass
