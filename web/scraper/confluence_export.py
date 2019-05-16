import getpass
import os
import requests
from xmlrpc import client
import yaml
from typing import Dict
from time import sleep
import zipfile


SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR) + '/'

# Changes to the appropriate directory before executing the script.
os.chdir(SCRIPT_DIR)


def read_yaml(path: str) -> Dict:
    """
    Reads in the yaml configuration files and coverts them into python dict opbjects

    :param path: The path to the yaml i

    :return: None
    """ 
    with open(path, 'r') as stream:
        return yaml.load(stream)


class HtmlGenerator:
    """
    A class that generates the HTML files for offline confluence documentation.
    """

    def __init__(self, space_config: Dict, username: str, password: str):
        """
        Initializes the HTML Generation class.

        :param space_config:
        :param username:
        :param password:
        :param mongo_wrapper:
        """
        self._username = username
        self._password = password
        self._space_config = space_config
        self._server = client.ServerProxy(self._space_config['site'] + '/rpc/xmlrpc')
        self._token = self._server.confluence2.login(self._username,
                                                     self._password)
        self._export_dir = self._space_config['export_dir']
        self._zip_file_name = self._space_config['zip_file_name']

    def _explode_zip(self, path_to_zip_file: str):
        zip_ref = zipfile.ZipFile(path_to_zip_file, 'r')
        zip_ref.extractall(self._export_dir)
        zip_ref.close()

    def execute(self):
        url = self._server.confluence2.exportSpace(self._token, self._space_config['space_name'], "TYPE_HTML")
        response = requests.get(url, stream=True, auth=(self._username, self._password))
        if response.status_code == 200:
            file_path = '{}/{}'.format(self._export_dir, self._zip_file_name)
            with open(file_path, 'wb') as fhandle:
                for chunk in response.iter_content(1024):
                    fhandle.write(chunk)
            self._explode_zip(file_path)


def prompt_username() -> str:
    """
    Prompts for username
    :return:
    """
    username = input("Please enter your username: ")    
    return username


def prompt_password() -> str:
    """
    Prompts for password
    :return:
    """
    password = getpass.getpass("Please enter your password: ")
    return password


def main():
    scrapper_config = read_yaml('scraper_config.yml')
    if not scrapper_config.get('username'):
        username = prompt_username()
    else:
        username = scrapper_config.get('username')

    if not scrapper_config.get('password'):
        password = prompt_password()
    else:
        password = scrapper_config.get('password')
    
    for space_config in scrapper_config['confluence_spaces']:
        html_gen = HtmlGenerator(space_config, username, password)
        html_gen.execute()


if __name__ == "__main__":
    main()
