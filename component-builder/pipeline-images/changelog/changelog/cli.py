#!/usr/bin/env python


import click
from changelog.commands import (
    CommandResult,
    GenerateReleaseCommand,
    GenerateUnreleasedCommand,
    MarkdownDirectoryToHTML,
)


@click.group(name="changelog")
def cli():
    """Changelog generation and preview tool."""
    pass


@click.group(name="generate")
def generate():
    """Generate changelog(s) and TOC in an output directory."""
    pass


def print_verbose_with_click(result: CommandResult, verbose: bool):
    """
    Prints the result message using click.echo if verbose mode is enabled.

    Args:
        result (CommandResult): The result of a command.
        verbose (bool): Flag indicating whether verbose mode is enabled.
    """
    if verbose:
        click.echo(result.result_message)


@generate.command(name="release")
@click.option(
    "--from",
    "from_version",
    default=None,
    help="Starting release version for changelog generation (ex.: '3.8' or '3.7.4') (default: latest release version) ",
)
@click.option(
    "--to",
    "to_version",
    default=None,
    help="Ending release version for changelog generation (ex.: '3.8' or '3.7.4')  (default: latest release version)",
)
@click.option(
    "--output-directory",
    "output_dir",
    default="",
    help="The directory to output the generated changelogs to. (default: random temp directory)",
)
@click.option("--verbose", is_flag=True, help="Enable verbose output.", default=False)
def generate_release(from_version, to_version, output_dir, verbose: bool):
    """
    Generate changelog(s) for release version(s). Takes a starting version and an ending version and generates the changelog(s) for the versions in between.

    Args:
        from_version (str): The starting version for generating release notes.
        to_version (str): The ending version for generating release notes.
        output_dir (str): The directory where the generated release notes will be saved. (default: random temp directory)
        verbose (bool): Enable verbose output. (default: False)

    Returns:
        None
    """
    generate_release_cmd = GenerateReleaseCommand(from_version, to_version, output_dir)

    result = generate_release_cmd.execute()
    print_verbose_with_click(result, verbose)


@generate.command(name="unreleased")
@click.option(
    "--from",
    "from_branch",
    default=None,
    help="The branch to compare against the against_version. (default: current branch)",
)
@click.option(
    "--against",
    "against_version",
    default=None,
    help="The release version to compare the branch against. (default: latest release version)",
)
@click.option(
    "--output-directory",
    "output_dir",
    default="",
    help="The directory to output the generated changelogs to. (default: random temp directory)",
)
@click.option("--verbose", is_flag=True, help="Enable verbose output.", default=False)
def generate_unreleased(from_branch, against_version, output_dir, verbose: bool):
    # sourcery skip: move-assign
    """
    Generate UNRELEASED.md changelog from branch against version.

    Examples:
    changelog generate unreleased --from-branch 'devel' --against '3.8' --output-directory 'temp'

    changelog generate unreleased --from-branch 'devel' --against '3.8' --output-directory 'temp' --verbose

    changelog generate unreleased --against '3.8' --output-directory 'temp' # from_branch defaults to current branch

    changelog generate unreleased --output-directory 'temp' # against_version defaults to latest release version

    changelog generate unreleased # from_branch defaults to current branch and against_version defaults to latest release version

    Args:
        from_branch (str): The branch to compare against the against_version. (default: current branch)
        against_version (str): The release version to compare the from branch against. (default: latest release version)
        output_dir (str): The directory where the generated release notes will be saved. (default: random temp directory)
        verbose (bool): Enable verbose output. (default: False)

    Returns:
        None
    """
    gen_unreleased_cmd = GenerateUnreleasedCommand(
        from_branch=from_branch,
        against_version=against_version,
        use_release_name=False,
        output_dir=output_dir,
    )
    result = gen_unreleased_cmd.execute()

    print_verbose_with_click(result, verbose)

@cli.command(name="dir2html")
@click.option(
    "--input-directory",
    "input_dir",
    default="",
    help="The directory to read the markdown files from. (default: current directory)"
)
@click.option(
    "--output-directory",
    "output_dir",
    default="",
    help="The directory to output the generated changelogs to. (default: random temp directory)",
)
@click.option("--verbose", is_flag=True, help="Enable verbose output.", default=False)
def dir2html(input_dir, output_dir, verbose: bool):
    """
    Generate HTML changelog(s) from markdown files in a directory.

    Args:
        output_dir (str): The directory where the generated release notes will be saved. (default: random temp directory)
        verbose (bool): Enable verbose output. (default: False)

    Returns:
        None
    """

    dir2html_cmd = MarkdownDirectoryToHTML(input_dir=input_dir, output_dir=output_dir)
    result = dir2html_cmd.execute()

    print_verbose_with_click(result, verbose)

cli.add_command(generate)
cli.add_command(dir2html)

if __name__ == "__main__":
    cli()
