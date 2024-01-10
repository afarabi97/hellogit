from pathlib import Path

import pytest
from changelog.commands import (
    CommandResult,
    GenerateReleaseCommand,
    GenerateUnreleasedCommand,
    MarkdownDirectoryToHTML,
    Preview,
    Update,
    Version,
)
from changelog.logg import Release


@pytest.fixture(scope="function")
def commands_dir(tmp_path_factory):
    return tmp_path_factory.mktemp("commands")


def test_generate_release_command(commands_dir: Path, capsys):
    NUM_OF_CHANGELOG_CREATED_STRING = "Number of Changelogs Created: "
    NUM_OF_VERSIONS_IN_TABLE_OF_CONTENTS_STRING = (
        "Number of Versions in Table of Contents: "
    )
    TOC_PATH_STRING = f"Table of Contents Path: {str(commands_dir)}/index.md"

    output_dir = str(commands_dir)
    from_version_str = "3.7.4"
    to_version_str = "3.9"
    cli_command = f"changelog generate release --from-branch {from_version_str} --against {to_version_str} --output-directory {output_dir}"

    cmd = GenerateReleaseCommand(
        from_version=from_version_str, to_version=to_version_str, output_dir=output_dir
    )

    # Call the execute method and assert the result
    result = cmd.execute()
    result_message = result.result_message

    assert isinstance(result, CommandResult)
    assert (
        result_message.find(f"{TOC_PATH_STRING}") != -1
    ), "Table of Contents Path should be in the result message with the correct path"

    # Find the text "Number of Changelogs Created: " in the result string
    # Get the number that follows the text
    # Get Number of Versions in Table of Contents
    number_of_changelogs_index = result_message.find(
        NUM_OF_CHANGELOG_CREATED_STRING
    ) + len(NUM_OF_CHANGELOG_CREATED_STRING)
    number_of_changelogs = int(result_message[number_of_changelogs_index])
    number_of_versions_index = result_message.find(
        NUM_OF_VERSIONS_IN_TABLE_OF_CONTENTS_STRING
    ) + len(NUM_OF_VERSIONS_IN_TABLE_OF_CONTENTS_STRING)
    number_of_versions = int(result_message[number_of_versions_index])

    assert (
        number_of_versions == number_of_changelogs
    ), "Number of versions in table of contents should be equal to the number of changelogs created"
    assert (
        number_of_versions != 0
    ), "Number of versions in table of contents should not be 0"
    assert number_of_changelogs != 0, "Number of changelogs created should not be 0"

    with capsys.disabled():
        print("\nTEST EXECUTION RESULTS\n================")
        print("Test Name: test_generate_release")
        print(f"Result Code: {result.result_code}")
        print(f"Output Dir: {output_dir}")
        print(f"Cli Command: {cli_command}")


def test_generate_unreleased_command(commands_dir: Path, capsys):
    """
    Test case for the `generate_unreleased_command` function.

    This test verifies that the `generate_unreleased_command` function correctly generates
    an unreleased changelog by comparing the from_version and the current branch. It checks
    that the output directory contains the UNRELEASED.md file and that the result of the
    command execution is a CommandResult object with a result_code of 0 and a non-empty
    result_message.

    Args:
        commands_dir (Path): The directory where the command is executed.
        capsys: The pytest fixture for capturing stdout and stderr.

    Returns:
        None
    """
    output_dir = str(commands_dir)
    unreleased_path = commands_dir / "UNRELEASED.md"
    from_branch = "devel"
    against_version = "3.8"
    cli_command = f"changelog generate unreleased --from-branch {from_branch} --against {against_version} --output-directory {output_dir}"

    gen_unreleased_cmd = GenerateUnreleasedCommand(
        from_branch=from_branch,
        against_version=against_version,
        use_release_name=False,
        output_dir=output_dir,
    )
    result = gen_unreleased_cmd.execute()

    assert all(
        [
            isinstance(result, CommandResult),
            result.result_code == 0,
            result.result_message != "",
        ]
    ), "Result should be a CommandResult with a result_code of 0 and a result_message that is not empty"
    assert unreleased_path.exists(), "UNRELEASED.md should be in the output directory"

    with capsys.disabled():
        print("\n\nTEST EXECUTION RESULTS\n================")
        print("Test Name: test_generate_unreleased")
        print(f"Result Code: {result.result_code}")
        print(f"Unreleased Path: {str(unreleased_path)}")
        print(f"Cli Command: {cli_command}")

def test_markdown_directory_to_html(commands_dir, capsys):
    output_dir = str(commands_dir)
    unreleased_path = commands_dir / "UNRELEASED.md"
    from_branch = "devel"
    against_version = "3.8"
    cli_command = f"changelog generate unreleased --from-branch {from_branch} --against {against_version} --output-directory {output_dir}"

    gen_unreleased_cmd = GenerateUnreleasedCommand(
        from_branch=from_branch,
        against_version=against_version,
        use_release_name=False,
        output_dir=output_dir,
    )

    gen_unreleased_cmd.execute()

    input_md_dir_path = Path(commands_dir)
    output_html_dir_path = Path(commands_dir) / 'html'

    input_dir = str(input_md_dir_path)
    html_output_dir = str(output_html_dir_path)

    md2html_cmd = MarkdownDirectoryToHTML(input_dir=input_dir, output_dir=html_output_dir)
    result = md2html_cmd.execute()

    with capsys.disabled():
        print("\n\nTEST EXECUTION RESULTS\n================")
        print("Test Name: test_markdown_directory_to_html")
        print(f"Result Code: {result.result_code}")
        print(f"Unreleased Path: {str(unreleased_path)}")
        print(f"Cli Command: {cli_command}")

@pytest.mark.skip(reason="Not fully implemented/supported yet")
def test_preview():
    # Create an instance of Preview
    preview = Preview()

    # Call the execute method and assert the result
    preview.execute()
    # Add assertions here


@pytest.mark.skip(reason="Not fully implemented/supported yet")
def test_update():
    # Create an instance of Update
    update = Update()

    # Call the execute method and assert the result
    update.execute()
    # Add assertions here


@pytest.mark.skip(reason="Not fully implemented/supported yet")
def test_version():
    # Create an instance of Version
    version = Version()

    # Call the execute method and assert the result
    version.execute()
    # Add assertions here
