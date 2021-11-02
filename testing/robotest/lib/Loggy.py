from robot.libraries.BuiltIn import BuiltIn
from robot.api import logger

class Loggy:
    ROBOT_LISTENER_API_VERSION = 2
    ROBOT_LIBRARY_SCOPE = "GLOBAL"

    def __init__(self):
        self.ROBOT_LIBRARY_LISTENER = self
        self.keywords = []
        self.testname = 'default test name'
        self.previous_case_keyword = 'default previous case keyword'
        self.COLOR_HEADER = '\033[95m'
        self.COLOR_OKBLUE = '\033[94m'
        self.COLOR_OKCYAN = '\033[96m'
        self.COLOR_OKGREEN = '\033[92m'
        self.COLOR_WARNING = '\033[93m'
        self.COLOR_FAIL = '\033[91m'
        self.COLOR_ENDC = '\033[0m'
        self.COLOR_BOLD = '\033[1m'
        self.COLOR_UNDERLINE = '\033[4m'

    def _start_keyword(self, name, attrs):
        self.testname = BuiltIn().get_variable_value("${TEST_NAME}")
        if (attrs['source'] and 'dipIntegration.robot' in attrs['source']):
            self.keywords.append(attrs['kwname'])


    def _end_keyword(self, name, attrs):
        if (attrs and attrs['source'] and 'dipIntegration.robot' in attrs['source']):
            self.keywords.pop()

    def loggy(self, text, isError: bool = False):
        log_start_color = self.COLOR_OKGREEN

        if (isError):
            log_start_color = self.COLOR_FAIL

        if(self.keywords and self.keywords[-1]):
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
            loggy_message = f"{case_keyword} | {self.COLOR_OKGREEN}{text}{self.COLOR_ENDC}"
            logger.console(loggy_message)

    def failure(self):
        loggy_message = f"{self.COLOR_FAIL}| FAIL | - {self.testname} has failed {self.COLOR_ENDC}"
        logger.console(loggy_message)
