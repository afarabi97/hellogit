from typing import List, Tuple

import requests
from app.models.kubernetes import DockerImageModel
from flask import Response


def get_docker_registry() -> List[DockerImageModel]:
    ret_val = []
    response = requests.get("http://localhost:5000/v2/_catalog")  # type: Response
    if response.status_code == 200:
        repos = response.json()["repositories"]
        for repo in repos:
            tags = _get_docker_repo_tags(repo)
            metadata = []
            if tags:
                for tag in tags:
                    image_id, image_size = _get_imageid_and_size(repo, tag)
                    metadata.append({ "tag": tag, "image_id": image_id, "image_size": image_size })
                ret_val.append({ "name": repo, "metadata": metadata })
    return ret_val


def _get_docker_repo_tags(repo: str) -> List[str]:
    url = "http://localhost:5000/v2/{}/tags/list".format(repo)
    response = requests.get(url)  # type: Response
    if response.status_code == 200:
        return response.json()["tags"]
    return (_get_docker_repo_tags)


def _get_imageid_and_size(repo: str, tag: str) -> Tuple[str, float]:
    url = "http://localhost:5000/v2/{repo}/manifests/{tag}".format(repo=repo, tag=tag)
    headers = {"Accept": "application/vnd.docker.distribution.manifest.v2+json"}
    response = requests.get(url, headers=headers)  # type: Response
    if response.status_code == 200:
        manifest = response.json()
        image_id = manifest["config"]["digest"][7:19]
        total = manifest["config"]["size"]
        for layer in manifest["layers"]:
            total += layer["size"]
                # Covert it back to MB
            total = total / 1000 / 1000
            return image_id, round(total, 2)
        return ("Not in image manifest", 0.0)
    else:
        return ("Not in image manifest", 0.0)
