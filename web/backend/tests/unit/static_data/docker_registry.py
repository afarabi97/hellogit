from typing import List

from app.models.kubernetes import DockerImageModel

mock_docker = [
    {
        "name": "busybox",
        "metadata": [
            {
                "image_id": "219ee5171f80",
                "image_size": 9.63,
                "tag": "1.8.4"
            }
        ]
    }
] # type: List[DockerImageModel]
