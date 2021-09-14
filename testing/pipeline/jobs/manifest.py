from models.manifest import ManifestSettings
import ruamel.yaml as yaml
import shutil
import os
import sys
import re

def load_manifest(file: str, type: str) -> dict:
        with open (file, 'r') as file:
            data = yaml.safe_load(file)
        return data[type]

class VerifyManifestJob():

    def __init__(self, manifest: ManifestSettings):
        self.manifest = manifest

    def verify_paths_exist(self):
        manifest = load_manifest(self.manifest.manifest_file, self.manifest.type)
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

    def check_release_folder(self):
        if self.manifest.type == "GIP":
            release_folder = os.path.join(self.manifest.drive_creation_path, "staging_gip", "v" + self.manifest.version, self.manifest.type)
        else:
            release_folder = os.path.join(self.manifest.drive_creation_path, "staging", "v" + self.manifest.version, self.manifest.type)

        if os.path.isdir(release_folder):
            print("Deleting old release folder {}".format(release_folder))
            shutil.rmtree(release_folder)

        print("Building release candidate main directory {}".format(release_folder))
        os.makedirs(release_folder)

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
            text_to_find='CVA/H Build:.\d.\d',
            substitution='CVA/H Build: ' + self.manifest.version
            )

            self.replace_text(
            text_file_path,
            text_to_find='CVAH.\d.\d',
            substitution='CVAH ' + self.manifest.version
            )

    def check_dir_exists(self, dest_path: str):
        if not os.path.isdir(dest_path):
            os.makedirs(dest_path)

    def find_app_dir(self, path: str):
        path = path.split("/")[:-1]
        path = "/".join(path)
        pos = path.rfind("/")
        return path[pos:]

    def build_manifest(self):
        manifest = load_manifest(self.manifest.manifest_file, self.manifest.type)
        self.check_release_folder()

        for path in manifest:
            for src in path['src']:
                src_path = os.path.join(self.manifest.drive_creation_path, src)
                dest_path = os.path.join(self.manifest.drive_creation_path, path['dest'])

                if path['app'] == 'AppStore' or path['app'] == 'Documentation':
                    app_folder = self.find_app_dir(src_path)
                else:
                    pos = src_path.rfind("/")
                    app_folder = src_path[pos:]

                self.check_dir_exists(dest_path)
                self.modify_readme(src_path)

                if os.path.isdir(src_path):
                    shutil.copytree(src_path, dest_path + app_folder)
                else:
                    shutil.copy2(src_path, dest_path)

    def execute(self):
        self.build_manifest()
