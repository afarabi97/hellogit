from pathlib import Path
from typing import Optional

import pytest
from changelog.cli import cli
from click.testing import CliRunner, Result


@pytest.fixture(scope="function")
def temp_directory(tmp_path):
    return tmp_path


def print_test_directory_info(
    capsys,
    test_stage: str,
    test_name: str,
    test_cmd: str,
    temp_directory,
    result: Optional[Result] = None,
):
    with capsys.disabled():
        print("\n")
        print("-" * 20)
        print(f"{test_stage.capitalize()} {test_name}")
        print(f"Command: {test_cmd}")
        print(f"temp_directory: {temp_directory}")
        print(f"temp_directory.exists(): {temp_directory.exists()}")
        print(f"temp_directory.is_dir(): {temp_directory.is_dir()}")
        print(f"temp_directory.glob('*.md'): {list(temp_directory.glob('*.md'))}")
        print("\n")
        if result:
            print(f"result.exit_code: {result.exit_code}")
            print(f"result.output: {result.output}")
            print("\n")


def assert_standard_runner_result(
    result, changelog_dir: Path, expected_exit_code: int = 0
):
    # At the very least, it Asserts the runners exit_code was what we expected it to be
    assert (
        result.exit_code == expected_exit_code
    ), f"Exit code is not {expected_exit_code}: {result.exit_code}"

    assert changelog_dir.exists, "Output Directory does not exists"
    assert changelog_dir.is_dir, "Output Directory is not a directory"
    assert (changelog_dir / "index.md").exists, "Index file does not exists"
    assert (changelog_dir / "index.md").is_file, "Index file is not a file"


def test_generate_release(temp_directory: Path, capsys):
    test_cmd = f"changelog generate release --output-directory {temp_directory}"
    print_test_directory_info(
        capsys, "starting", "test_generate_release", test_cmd, temp_directory
    )
    # changelog generate release | should get the latest release and make the index with just one release
    runner = CliRunner()
    result: Result = runner.invoke(
        cli, ["generate", "release", "--output-directory", temp_directory]
    )
    print_test_directory_info(
        capsys, "finished", "test_generate_release", test_cmd, temp_directory, result
    )
    assert_standard_runner_result(result, temp_directory)


def test_generate_unreleased(temp_directory: Path, capsys):
    branch_name = "devel"
    against_version = "3.8"

    test_cmd = f"changelog generate unreleased --from {branch_name} --against {against_version} --output-directory {temp_directory}"
    print_test_directory_info(
        capsys, "starting", "test_generate_unreleased", test_cmd, temp_directory
    )
    # changelog generate unreleased | should get the latest release and make the index with just one release
    runner = CliRunner()
    result: Result = runner.invoke(
        cli,
        [
            "generate",
            "unreleased",
            "--from",
            branch_name,
            "--against",
            against_version,
            "--output-directory",
            temp_directory,
        ],
    )
    print_test_directory_info(
        capsys, "finished", "test_generate_unreleased", test_cmd, temp_directory, result
    )
    assert_standard_runner_result(result, temp_directory)


def test_generate_from_to(temp_directory: Path, capsys):
    # changelog generate --from '3.7.4' --directory='./changelog' | should get from 4.7.4 to latest and make the index
    test_cmd = f"changelog generate release --from '3.7.4' --to '3.9' --output-directory {temp_directory}"
    print_test_directory_info(
        capsys, "starting", "test_generate_from_to", test_cmd, temp_directory
    )
    # changelog generate | should get the latest release and make the index with just one

    runner = CliRunner()
    result = runner.invoke(
        cli,
        [
            "generate",
            "release",
            "--from",
            "3.7.4",
            "--to",
            "3.9",
            "--output-directory",
            temp_directory,
        ],
    )

    print_test_directory_info(
        capsys, "finished", "test_generate_from_to", test_cmd, temp_directory, result
    )

    assert_standard_runner_result(result, temp_directory)


def test_dir2html(temp_directory: Path, capsys):
    """
    Test the 'dir2html' command of the 'changelog' CLI.

    Args:
        temp_directory (Path): The temporary directory for testing.
        capsys: The pytest fixture for capturing stdout and stderr.

    Returns:
        None
    """
    # changelog dir2html --input-directory /tmp/changelog --output-directory /tmp/changelog/html
    markdown_input_dir = temp_directory
    html_output_dir = temp_directory / "html"
    test_cmd = f"changelog dir2html --input-directory {str(markdown_input_dir)} --output-directory {str(html_output_dir)}"

    print_test_directory_info(
        capsys, "starting", "test_generate_from_to", test_cmd, temp_directory
    )

    runner = CliRunner()
    result = runner.invoke(
        cli,
        [
            "generate",
            "release",
            "--from",
            "3.7.4",
            "--to",
            "3.9",
            "--output-directory",
            temp_directory,
        ],
    )

    html_runner = CliRunner()
    html_result = html_runner.invoke(
        cli,
        [
            "dir2html",
            "--input-directory",
            str(markdown_input_dir),
            "--output-directory",
            str(html_output_dir),
        ],
    )

    print_test_directory_info(
        capsys, "finished", "test_dir2html", test_cmd, temp_directory, result
    )
    assert_standard_runner_result(result, temp_directory)

    assert html_output_dir.exists(), "HTML Output Directory does not exist"
    assert html_output_dir.is_dir(), "HTML Output Directory is not a directory"
    assert (html_output_dir / "index.html").exists(), "Index file does not exist"
    assert all(file_path.name.endswith(".html") for file_path in html_output_dir.glob("*")), "Not all files in the HTML Output Directory end with .html"


@pytest.mark.skip(reason="Not fully implemented/supported yet")
def test_generate_update_only(temp_directory: Path, capsys):
    # Create a changelog file for the previous release in the temp_directory
    fake_changelog_release_file = temp_directory / "3.8.0.0.md"
    fake_changelog_toc_file = temp_directory / "index.md"
    fake_changelog_content = "# FAKE CONTENT FAKE CONTENT FAKE CONTENT"
    fake_changelog_release_file.write_text(fake_changelog_content)
    fake_changelog_toc_file.write_text(fake_changelog_content)

    test_cmd = f"changelog generate --update-only --output-directory {temp_directory}"
    print_test_directory_info(
        capsys, "starting", "test_generate_update_only", test_cmd, temp_directory
    )
    # changelog generate | should get the latest release and make the index with just one
    runner = CliRunner()
    result: Result = runner.invoke(
        cli, ["generate", "--update-only", "--output-directory", temp_directory]
    )
    print_test_directory_info(
        capsys,
        "finished",
        "test_generate_update_only",
        test_cmd,
        temp_directory,
        result,
    )
    assert_standard_runner_result(result, temp_directory)

    assert (
        fake_changelog_release_file.read_text() == fake_changelog_content
    ), "Update-only should not have changed a release file"
    assert (
        fake_changelog_toc_file.read_text() != fake_changelog_content
    ), "Update-only should have changed the index file"
