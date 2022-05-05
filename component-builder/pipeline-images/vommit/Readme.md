# TFPlenum Commit Rules

TFplenum Commit Message Format can be found here: https://confluence.di2e.net/display/THISISCVAH/5.4+TFPlenum+Commit+Message+Format

## Updating The Image

Please update the version of vommit in validate_latest_commit.sh when making changes to this image. `bash validate_latest_commit.sh` only works on systems with docker and access to the nexus repository.

## Mandatory Rules

### Title Rules

-   **title-requires-valid-type** **_(UC1):_** Title line must begin with a valid type surrounded by parenthesis
    -   (build|chore|ci|docs|feat|fix|perf|refactor|sus|style|test|loc)
-   **title-requires-jira-identifier** **_(UC2):_** Title line must contain a jira_ticket_identifier immediately after the type, followed by a dash and 5 digits followed by a colon
    -   THISISCVAH-#####:
-   Title line message must be under 101 chars in total

### Body Rules

-   **body-lines-start-with-dash** **_(UC3):_** A commit must have a Body whose lines must begin with a dash, followed by a hyphen
-   **body-changed-file-mention** **_(B7):_** If one of the following files are changed, the body of the commit message **MUST** mention the file:
    -   versions.yml
    -   manifest.yml
    -   aliasess
    -   .gitlab-ci.yml
    -   README.md
    -   .gitlint
    -   gitlab/\*.yml

### Trailer Rules

-   **trailer-has-issue-field** **_(UC4):_** Trailer must contain an Issue line that starts with the word Issue, is followed by a colon + space and contains a link to the jira ticket this incident closes
