from gitlint.rules import CommitRule, CommitMessageBody, CommitMessageTitle, RuleViolation
import re

COMMIT_TYPE_REGEXP = re.compile(
    r"^\((build|ci|chore|sus|docs|feat|fix|perf|refactor|style|test|loc)\)")
JIRA_IDENTIFIER_REGEXP = re.compile(
    r"^\((build|ci|chore|sus|docs|feat|fix|perf|refactor|style|test|loc)\)[\s](THISISCVAH[-][0-9]{0,6}[:][\s])")

BODY_LINE_STARTS_WITH_DASH_REGEXP = re.compile(r"^([-][\s]|[\t]{1,3}[-][\s])")
TRAILER_FIELDS_REGEXP = re.compile(
    r"^(Issue|Test|More Information|Documentation|Docs|Co-Authored By|Closes)[:][\s]")

TRAILER_ISSUE_REGEXP = re.compile(
    r"^(Issue:[\s]https://jira.*/browse/THISISCVAH-[0-9]{,6}$)")

class TitleCommitType(CommitRule):
    """ This rule will enforce that the type of commit is valid
    """
    name = "title-requires-valid-type"
    id = "UC1"
    target = CommitMessageTitle

    def validate(self, commit):
        self.log.debug(
            "TitleCommitType | title-requires-valid-type: `gitlint --debug`")

        match = COMMIT_TYPE_REGEXP.match(commit.message.title)
        if match:
            return []
        return [RuleViolation(self.id, "Title does not begin with a valid type, surrounded by parenthesis: (build|ci|sus|docs|feat|fix|perf|refactor|style|test|loc)", line_nr=1)]


class TitleJiraIdentifier(CommitRule):
    """ This rule will enforce that the jira identifier is present and in the correct place
    """
    name = "title-requires-jira-identifier"
    id = "UC2"
    target = CommitMessageTitle

    def validate(self, commit):
        # commit.message.title	string	Title/subject of the commit message: the first line
        self.log.debug(
            "TitleCommitType | title-requires-valid-type: `gitlint --debug`")

        match = JIRA_IDENTIFIER_REGEXP.match(commit.message.title)
        if match:
            return []
        return [RuleViolation(self.id, "Title line must contain a jira_ticket_identifier immediately after the type, followed by a dash and 5 digits followed by a colon", line_nr=1)]


class BodyLinesDash(CommitRule):
    """ This rule will enforce that each commit body line starts with a "- ".
    """

    name = "body-lines-start-with-dash"
    id = "UC3"
    target = CommitMessageBody

    def is_separator_line(self, count: int, line: str,  body: list):  # type: ignore
        # If it is 0, is empty, THEN it is a title_seperator line
        try:
            next_line = body[count+1]
        except IndexError as e:
            pass
        else:
            if count == 0 and not line and next_line:
                self.log.debug(f"is_title_seperator | next_line: {next_line}")
                return True, "title_seperator"

            # If its greater than 0, empty, and next_line starts with Issue:, THEN its a trailer_seperator line
            trailer_seperator_match = TRAILER_FIELDS_REGEXP.match(next_line)
            if count > 0 and not line and next_line and trailer_seperator_match:
                self.log.debug(
                    f"is_trailer_seperator | next_line: {next_line}")
                return True, "trailer_seperator"
        return False, "not_separator"

    def validate(self, commit):
        self.log.debug("Commit Message Body: ", commit.message.body)
        for count, line in enumerate(commit.message.body):
            match = BODY_LINE_STARTS_WITH_DASH_REGEXP.match(line)
            is_separator, separator_type = self.is_separator_line(  # type: ignore
                count, line, commit.message.body)  # type: ignore
            if separator_type == "trailer_seperator":
                break
            if not match and not is_separator:
                msg = "A commit must have a Body whose lines must begin with a dash, followed by a hyphen"
                violation = RuleViolation(
                    self.id, msg, line, line_nr=count+1)
                return [violation]
        return []


class TrailerIssue(CommitRule):
    """ This rule will enforce that each commit has an Issue field
    """

    name = "trailer-has-issue-field"
    id = "UC4"
    target = CommitMessageBody

    def validate(self, commit):
        for line in commit.message.body:
            match = TRAILER_ISSUE_REGEXP.match(line)
            if match:
                return []
        return [RuleViolation(
            self.id, "Trailer must contain an Issue line that starts with the word Issue, is followed by a colon + space and contains a link to the jira ticket this incident closes", commit.message.body, line_nr=0)]
