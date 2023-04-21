from gitlint.rules import CommitRule, CommitMessageBody, CommitMessageTitle, RuleViolation
import re

COMMIT_TYPE_REGEXP = re.compile(
    r"^\((build|ci|chore|sus|docs|feat|fix|perf|refactor|style|test|loc)\)")
JIRA_IDENTIFIER_REGEXP = re.compile(
    r"^\((build|ci|chore|sus|docs|feat|fix|perf|refactor|style|test|loc)\)[\s]((THISISCVAH|AFDCO)[-][0-9]{0,6}[:][\s])")

BODY_LINE_STARTS_WITH_DASH_REGEXP = re.compile(r"^[-][\s]")

TRAILER_FIELDS_REGEXP = re.compile(
    r"^(Issue|Test|More Information|Documentation|Docs|Co-Authored By|Closes)[:][\s]")

TRAILER_ISSUE_REGEXP = re.compile(
    r"^(Issue:[\s](http(s)?://)?jira.*/browse/(THISISCVAH|AFDCO)-[0-9]{,6}$)")

TRAILER_CLOSES_REGEXP = re.compile(
    r"^(Closes:[\s])((THISISCVAH-|AFDCO-)?([0-9]{0,6}([,][\s])?))+$")

MAXIMUM_BODY_LINE_TABS = 3
class TitleCommitType(CommitRule):
    """ This rule will ensure that a valid commit type is present within the commit title
    """
    name = "title-requires-valid-type"
    id = "UC1"
    target = CommitMessageTitle

    def validate(self, commit):
        violations = []
        match = COMMIT_TYPE_REGEXP.match(commit.message.title)
        if not match:
            invalid_commit_title_violation_message="| COMMIT TYPE NOT ONE OF THE FOLLOWING (build, ci, chore, sus, docs, feat, fix, perf, refactor, style, test, loc)"
            invalid_commit_title_violation = RuleViolation(self.id, invalid_commit_title_violation_message, commit.message.title, line_nr=0)
            violations.append(invalid_commit_title_violation)

        return violations


class TitleJiraIdentifier(CommitRule):
    """ This rule will ensure that the jira identifier is present within the commit title
    """
    name = "title-requires-jira-identifier"
    id = "UC2"
    target = CommitMessageTitle

    def validate(self, commit):
        violation = []
        match = JIRA_IDENTIFIER_REGEXP.match(commit.message.title)
        if not match:
            jira_identifier_violation_message="| INVALID OR MISSING JIRA IDENTIFIER (THISISCVAH-12345, AFDCO-12345)"
            jira_identifier_violation = RuleViolation(self.id, jira_identifier_violation_message, commit.message.title)
            violation.append(jira_identifier_violation)
        return violation


class BodyLinesDash(CommitRule):
    """ This rule will ensure that each commit body line starts with a "- ".
    """

    name = "body-lines-start-with-dash"
    id = "UC3"
    target = CommitMessageBody

    def is_separator_line(self, line_count: int, line: str,  body: list):  # type: ignore
        try:
            next_line = body[line_count+1]
        except IndexError as e:
            pass
        else:
            if line_count == 0 and not line and next_line:
                return True, "title_seperator"
            trailer_seperator_match = TRAILER_FIELDS_REGEXP.match(next_line)
            if line_count > 0 and not line and next_line and trailer_seperator_match:
                self.log.debug(f"is_trailer_seperator | next_line: {next_line}")
                return True, "trailer_seperator"
        return False, "not_separator"

    def validate(self, commit):
        violations = []
        tab_tuple = ('    ', '        ', '          ', '\t')
        for line_count, line in enumerate(commit.message.body):
            line_nr = line_count+1

            is_match = BODY_LINE_STARTS_WITH_DASH_REGEXP.match(line)
            line_is_a_separator, separator_type = self.is_separator_line(
                line_count, line, commit.message.body)
            original_line = line
            original_len_line = len(original_line)

            # First body line can not start with a tab
            if line_count == 1 and not is_match and line and line.startswith(tab_tuple):
                first_body_line_violation_message="| FIRST BODY LINE MUST NOT BE TABBED"
                first_body_line_violation = RuleViolation(self.id, first_body_line_violation_message, line, line_nr=line_nr)
                violations.append(first_body_line_violation)

            # If the line is not a separator, and it does not
            # start with a dash, it is a potential violation
            if not is_match and line:
                # A body line MUST start with a dash or a tab and a dash
                if not line.startswith(tab_tuple):
                    # self.log.debug(f"not a match and tline does not start with tab | tline: {line}")
                    commit_body_line_violation_message=f"| INVALID BODY LINE SYNTAX USE: ({MAXIMUM_BODY_LINE_TABS} tabs) + dash(-) + space"
                    commit_body_line_violation = RuleViolation(self.id, commit_body_line_violation_message, line, line_nr=line_nr)
                    violations.append(commit_body_line_violation)

                # A body line that starts with a tab is first stripped
                else:
                    line = line.lstrip()
                    line_len_diff = int((original_len_line - len(line)) / 4)
                    is_match = BODY_LINE_STARTS_WITH_DASH_REGEXP.match(line)

                    # A stripped body line that starts with a tab MUST start with a dash
                    if not is_match or line_len_diff > MAXIMUM_BODY_LINE_TABS:
                        # self.log.debug(f"line starts with tab but not a proper match | line: {line}")
                        stripped_body_line_violation_message=f"| BODY LINE DOES NOT HAVE A DASH AND SPACE AFTER THE TAB(s)"
                        stripped_body_line_violation = RuleViolation(self.id, stripped_body_line_violation_message, original_line, line_nr=line_nr)
                        violations.append(stripped_body_line_violation)

            # This is the separator line for the trailer. Exit the evaluation to proceess the trailer
            if line_is_a_separator and separator_type == "trailer_seperator":
                break

        return violations


class TrailerIssue(CommitRule):
    """ This rule will ensure that each commit has an Issue field
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
            self.id, "| INVALID OR MISSING ISSUE LINE IN TRAILER. (Issue: <jira_link>)", commit.message.body, line_nr=0)]


class TrailerCloses(CommitRule):
    """ This rule will ensure that the Closes trailer is valid
    """

    name = "trailer-closes-issue"
    id = "UC5"
    target = CommitMessageBody

    def validate(self, commit):
        violations = []
        trailer_count = 0
        for line_count, line in enumerate(commit.message.body):
            line_nr = line_count+1

            # This is a Closes Trailer line
            if line.startswith("Closes:"):
                trailer_count += 1
                match = TRAILER_CLOSES_REGEXP.match(line)
                if not match or trailer_count > 1:
                    if trailer_count > 1:
                        trailer_close_count_violation_message = "| MORE THAN ONE CLOSES TRAILERS. COMBINE OR DELETE THE EXTRAS"
                        trailer_close_count_violation = RuleViolation(self.id, trailer_close_count_violation_message, line, line_nr=line_nr)
                        violations.append(trailer_close_count_violation)
                    if not match:
                        trailer_close_match_violation_message="| INVALID CLOSES TRAILER FORMAT. VALID SYNTAX (Closes: 12345, THISISCVAH-12345, AFDCO-12345)"
                        trailer_close_match_violation = RuleViolation(
                            self.id, trailer_close_match_violation_message, line, line_nr=line_nr)
                        violations.append(trailer_close_match_violation)
        return violations
