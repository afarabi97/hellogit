from models.manifest import ManifestSettings
import ruamel.yaml as yaml
import shutil
import os
import sys
import re
from jinja2 import Environment, Template, select_autoescape
from jinja2.loaders import FileSystemLoader

def load_manifest(file: str, type: str, ver: str) -> dict:
        yaml_dict = {}
        with open (file, 'r') as file:
            template = Template(file.read())
            rendered_template = template.render(yaml_dict, VERSION=ver)
            data = yaml.safe_load(rendered_template)
        return data[type]

class VerifyManifestJob():

    def __init__(self, manifest: ManifestSettings):
        self.manifest = manifest

    def verify_paths_exist(self):
        manifest = load_manifest(self.manifest.manifest_file, self.manifest.type, self.manifest.version)
        unverified_path = []

        for path in manifest:
            for src in path['src']:
                src_path = os.path.join(self.manifest.drive_creation_path, src)
                if not os.path.exists(src_path):
                    unverified_path.append(src_path)
                    print("Path does not exist: {}".format(src_path))

        if len(unverified_path) > 0:
            print("Fix manifest file for {}".format(self.manifest.type))
            sys.exit(1)
        else:
            print("Manifest {} verified".format(self.manifest.type))

    def execute(self):
        self.verify_paths_exist()

class BuildManifestJob():

    def __init__(self, manifest: ManifestSettings):
        self.manifest = manifest
        self.release_folder = os.path.join(self.manifest.drive_creation_path, self.manifest.staging_export_path, "v" + self.manifest.version)
        self.release_folder_type = os.path.join(self.release_folder, self.manifest.type)

    def check_release_folder(self):
        if os.path.isdir(self.release_folder_type):
            print("Deleting old release folder {}".format(self.release_folder_type))
            shutil.rmtree(self.release_folder_type)

        print("Building release candidate main directory {}".format(self.release_folder_type))
        os.makedirs(self.release_folder_type)

    def replace_text(self,src: str, text_to_find: str, substitution: str):
        with open(src, 'r+') as file:
            file_contents = file.read()
            text = re.findall(text_to_find, file_contents)
            if text:
                text_pattern = re.compile(re.escape(text[0]), flags=0)
                file_contents = text_pattern.sub(substitution, file_contents)
                file.seek(0)
                file.truncate()
                file.write(file_contents)

    def modify_readme(self, path: str):
        files = ''
        if os.path.isdir(path):
            files = os.listdir(path)

        if "ReadMe.txt" in files:
            text_file_path = os.path.join(path, "ReadMe.txt")
        elif "ReadMe.txt" in path:
            text_file_path = path
        else:
            text_file_path = ''

        if text_file_path:
            self.replace_text(
                text_file_path,
                text_to_find='CVA/H Build:[\w._ ]*',
                substitution='CVA/H Build: ' + self.manifest.version)

            self.replace_text(
                text_file_path,
                text_to_find='CVAH[\w._ ]*',
                substitution='CVAH ' + self.manifest.version)

    def check_dir_exists(self, dest_path: str):
        if not os.path.isdir(dest_path):
            os.makedirs(dest_path)

    def find_app_dir(self, path: str):
        path = path.split("/")[:-1]
        path = "/".join(path)
        pos = path.rfind("/")
        return path[pos:]

    def build_manifest(self):
        manifest = load_manifest(self.manifest.manifest_file, self.manifest.type, self.manifest.version)
        self.check_release_folder()

        for path in manifest:
            for src in path['src']:
                src_path = os.path.join(self.manifest.drive_creation_path, src)
                dest_path = os.path.join(self.release_folder, path['dest'])

                if path['app'] == 'AppStore' or path['app'] == 'VMs' or path['app'] == 'Documentation' or path['app'] == 'archive' or path['app'] == 'firmware':
                    app_folder = self.find_app_dir(src_path)
                else:
                    pos = src_path.rfind("/")
                    app_folder = src_path[pos:]

                self.check_dir_exists(dest_path)

                if os.path.isdir(src_path):
                    shutil.copytree(src_path, dest_path + app_folder)
                    self.modify_readme(dest_path + app_folder)
                else:
                    shutil.copy2(src_path, dest_path)
                    self.modify_readme(dest_path)

    def execute(self):
        self.build_manifest()
