from typing import List
from atlassian import Confluence
import tempfile
import pandas as pd
from util.constants import ROBOTEST_DIR, ROOT_DIR

class InternalVDDUtil(Confluence):
    CONFLUENCE_URL = 'https://confluence.di2e.net'
    CONFLUENCE_SPACE = 'THISISCVAH'
    CONFLUENCE_TITLE_TMPL = '{} Internal VDD'
    VDD_FILE_NAME_TMPL = '{}-INTERNAL-VDD'
    VDD_CSV_FILE_PATH_TMPL='{}{}.csv'



    def __init__(self, target_version: str, confluence_username: str, confluence_password: str):
        Confluence.__init__(self, url=self.CONFLUENCE_URL, username=confluence_username, password=confluence_password)
        self.target_version = target_version
        self.confluence_title = self.CONFLUENCE_TITLE_TMPL.format(self.target_version)
        self.vdd_file_name = self.VDD_FILE_NAME_TMPL.format(self.target_version)
        self.vdd_root_csv_file_path = self.VDD_CSV_FILE_PATH_TMPL.format(ROOT_DIR, self.vdd_file_name)
        self.vdd_robot_csv_file_path = self.VDD_CSV_FILE_PATH_TMPL.format(ROBOTEST_DIR, self.vdd_file_name)
        self.confluence_page_id = self.get_page_id(space=self.CONFLUENCE_SPACE, title=self.confluence_title)

    def _get_iv_content(self):
        # Get this versions internal vdd page and return the content
        page = self.get_page_by_id(page_id=self.confluence_page_id, expand='body.storage.value')
        iv_content = page['body']['storage']['value']
        return iv_content

    def save_vdd(self, save_full_path = None):
        with tempfile.NamedTemporaryFile(mode = 'w+') as fp:
            fp.write(self._get_iv_content())
            fp.seek(0)
            df = pd.read_html(fp.name)
            if save_full_path is None:
                df[0].to_csv(self.vdd_root_csv_file_path)
                df[0].to_csv(self.vdd_robot_csv_file_path)
            elif type(save_full_path) is str:
                df[0].to_csv(save_full_path)
            elif type(save_full_path) is list:
                for path in save_full_path:
                    df[0].to_csv(path)
