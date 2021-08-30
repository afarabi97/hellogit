from models.manifest import ManifestSettings
import ruamel.yaml as yaml

import os
import sys

class VerifyManifestJob():

    def __init__(self, manifest: ManifestSettings):
        self.manifest = manifest

    def load_manifest(self) -> dict:
        with open (self.manifest.manifest_file, 'r') as file:
            data = yaml.safe_load(file)
        return data[self.manifest.type]

    def verify_paths_exist(self):
        manifest = self.load_manifest()
        unverified_path = []

        for path in manifest:
            for src in path['src']:
                absolute_path = self.manifest.drive_creation_path + '/' + src
                if not os.path.exists(absolute_path):
                    unverified_path.append(absolute_path)
                    print("Path does not exist: {}".format(absolute_path))

        if len(unverified_path) > 0:
            print("Fix manifest file for {}".format(self.manifest.type))
            sys.exit(1)
        else:
            print("Manifest {} verified".format(self.manifest.type))

    def execute(self):
        self.verify_paths_exist()


