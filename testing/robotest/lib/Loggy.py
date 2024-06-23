from robot.libraries.BuiltIn import BuiltIn
from robot.libraries.BuiltIn import logger
from robot.api import logger
from pathlib import Path


class Loggy:
    ROBOT_LISTENER_API_VERSION = 2
    ROBOT_LIBRARY_SCOPE = "GLOBAL"

    def __init__(self, category):
        self.ROBOT_LIBRARY_LISTENER = self
        self.keywords = []
        self.testname = "default test name"
        self.previous_case_keyword = "default previous case keyword"
        self.COLOR_HEADER = "\033[95m"
        self.COLOR_OKBLUE = "\033[94m"
        self.COLOR_OKCYAN = "\033[96m"
        self.COLOR_OKGREEN = "\033[92m"
        self.COLOR_WARNING = "\033[93m"
        self.COLOR_FAIL = "\033[91m"
        self.COLOR_ENDC = "\033[0m"
        self.COLOR_BOLD = "\033[1m"
        self.COLOR_UNDERLINE = "\033[4m"
        self.test_case_list = self._generate_test_case_list("tests/integration", "tests/regression")

    def _generate_test_case_list(self, *keyword_relpaths):
        local_test_case_list: list[str] = []
        for rpath in keyword_relpaths:
            p = Path(rpath)
            tmp_test_suites_paths = [x for x in p.iterdir() if x.is_dir()]
            for tmp_test_suite_path in tmp_test_suites_paths:
                for test_case_path in tmp_test_suite_path.iterdir():
                    local_test_case_list.append(test_case_path.name)
        return local_test_case_list

    def _start_keyword(self, name, attrs):
        self.testname = BuiltIn().get_variable_value("${TEST_NAME}")
        for test_case in self.test_case_list:
            if attrs and attrs["source"] and test_case in attrs["source"]:
                self.keywords.append(attrs["kwname"])

    def _end_keyword(self, name, attrs):
        for test_case in self.test_case_list:
            if attrs and attrs["source"] and test_case in attrs["source"]:
                self.keywords.pop()

    def loggy(self, text, isError: bool = False):
        log_start_color = self.COLOR_OKGREEN

        if isError:
            log_start_color = self.COLOR_FAIL

        if self.keywords and self.keywords[-1]:
            case_keyword = f"{self.COLOR_OKBLUE}{self.keywords[-1]}{self.COLOR_ENDC}"
            if case_keyword != self.previous_case_keyword:
                self.previous_case_keyword = case_keyword
                logger.console("")
            loggy_message = f"{case_keyword} | {log_start_color}{text}{self.COLOR_ENDC}"
            logger.console(loggy_message)

        else:
            case_keyword = ""
            if case_keyword != self.previous_case_keyword:
                self.previous_case_keyword = case_keyword
                logger.console("")
            loggy_message = (
                f"{case_keyword} | {self.COLOR_OKGREEN}{text}{self.COLOR_ENDC}"
            )
            logger.console(loggy_message)

    def failure(self):
        loggy_message = (
            f"{self.COLOR_FAIL}| FAIL | - {self.testname} has failed {self.COLOR_ENDC}"
        )
        logger.console(loggy_message)
