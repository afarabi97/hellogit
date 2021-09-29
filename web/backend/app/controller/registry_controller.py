import requests

from app.models.kubernetes import KUBERNETES_NS
from app.utils.logging import logger
from app.models.kubernetes import DockerImageModel
from requests.exceptions import ConnectionError
from flask_restx import Resource
from requests.models import Response
from typing import List, Tuple


def get_docker_repo_tags(repo: str) -> List[str]:
    url = 'http://localhost:5000/v2/{}/tags/list'.format(repo)
    response = requests.get(url) # type: Response
    if response.status_code == 200:
        return response.json()["tags"]
    return []


def get_imageid_and_size(repo: str, tag: str) -> Tuple[str, float]:
    url = 'http://localhost:5000/v2/{repo}/manifests/{tag}'.format(repo=repo, tag=tag)
    headers = {'Accept': 'application/vnd.docker.distribution.manifest.v2+json'}
    response = requests.get(url, headers=headers) # type: Response
    if response.status_code == 200:
        manifest = response.json()
        image_id = manifest['config']['digest'][7:19]
        total = manifest['config']['size']
        for layer in manifest['layers']:
            total += layer['size']

        #Covert it back to MB
        total = total / 1000 / 1000
        return image_id, round(total, 2)
    return "", 0.0


@KUBERNETES_NS.route('/docker/registry')
class DockerRegistry(Resource):

    @KUBERNETES_NS.doc(description="Gets all the docker registry's containers and their versions.")
    @KUBERNETES_NS.response(200, 'DockerImage', [DockerImageModel.DTO])
    def get(self):
        ret_val = []
        try:
            response = requests.get('http://localhost:5000/v2/_catalog') # type: Response
            if response.status_code == 200:
                repos = response.json()['repositories']
                for repo in repos:
                    tags = get_docker_repo_tags(repo)
                    metadata = []
                    if tags:
                        for tag in tags:
                            image_id, image_size = get_imageid_and_size(repo, tag)
                            metadata.append({'tag': tag, 'image_id': image_id, 'image_size': image_size})

                        ret_val.append({"name": repo, "metadata": metadata})
        except ConnectionError as e:
            logger.exception(e)

        return ret_val
