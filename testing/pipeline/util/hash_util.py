import os
import hashlib

from pathlib import Path
from typing import Dict, Union


def hash_file(some_path: Union[str, Path], chunk_size=8192) -> Dict:
    path = None #type: Path
    if isinstance(some_path, str):
        path = Path(some_path)
    elif isinstance(some_path, Path):
        path = some_path
    else:
        raise ValueError("Invalid type passed into hash_file function.")

    md5 = hashlib.md5()
    sha1 = hashlib.sha1()
    sha256 = hashlib.sha256()

    with open(str(path), 'rb') as fp:
        while True:
            chunk = fp.read(chunk_size)
            if chunk:
                md5.update(chunk)
                sha1.update(chunk)
                sha256.update(chunk)
            else:
                break
    return {"md5": md5.hexdigest(), "sha1": sha1.hexdigest(), "sha256": sha256.hexdigest() }

def md5_sum(some_path: Union[str, Path], chunk_size=10000000) -> str:
    path = None #type: Path
    if isinstance(some_path, str):
        path = Path(some_path)
    elif isinstance(some_path, Path):
        path = some_path
    else:
        raise ValueError("Invalid type passed into hash_file function.")

    md5 = hashlib.md5()
    with open(str(path), 'rb') as fp:
        while True:
            chunk = fp.read(chunk_size)
            if chunk:
                md5.update(chunk)
            else:
                break
    return md5.hexdigest()

def create_hashes(directory_to_walk: str):
    if not directory_to_walk.endswith("/"):
        directory_to_walk = directory_to_walk + "/"

    cur_cwd = os.getcwd()
    try:
        cwd = Path(directory_to_walk)
        if not cwd.exists() or not cwd.is_dir():
            raise NotADirectoryError("{} is not a directory or does not exist".format(directory_to_walk))

        os.chdir(directory_to_walk)
        with open("drive_md5_hashes.txt", "w") as handle:
            for cur_path, directories, files in os.walk(directory_to_walk):
                relative_path = cur_path.replace(directory_to_walk, "")
                if relative_path != "":
                    relative_path = relative_path + "/"

                for some_file in files:
                    if some_file == "validate_drive.sh":
                        continue

                    if some_file == "drive_md5_hashes.txt":
                        continue

                    relative_file_path = relative_path + some_file
                    handle.write(md5_sum(relative_file_path) + "\t" + relative_file_path + "\n")
    finally:
        os.chdir(cur_cwd)
