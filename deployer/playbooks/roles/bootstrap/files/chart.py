import os
import sys
import yaml
import docker
import tarfile
from os import listdir
from os.path import isfile, join

def get_image(chart):
    tar = dir + chart
    tar = tarfile.open(tar)
    for member in tar.getmembers():
        if member.isreg() and "values.yaml" in member.name:
            f = tar.extractfile(member)
            stream = f.read()
            data = yaml.load(stream)
            if "image" in data and "tag" in data["image"] and "repository" in data["image"]:
              tag = data["image"]["tag"]
              repo = data["image"]["repository"]
              if "registry" in data["image"]:
                  registry = data["image"]["registry"]
              else:
                  registry = "docker.io"
              return [registry, repo, tag]
            else:
              print("skipping " + chart +"! Chart does not conform to standards!")
              continue

def get_charts(dir):
    files = [f for f in listdir(dir) if isfile(join(dir, f))]
    return files

dir = sys.argv[1]
client = docker.from_env()
local_registry = "localhost:5000"

charts = get_charts(dir)
for chart in charts:
    image = get_image(chart)
    if image:
      print("Pulling " + image[0] + "/" + image[1] + ":" + image[2])
      client.images.pull(image[0] + "/" + image[1] + ":" + image[2])
      img = client.images.get(image[1] + ":" + image[2])
      print("Tagging " + local_registry + "/" + image[1] + ":" + image[2])
      img.tag(local_registry + "/" + image[1] + ":" + image[2])
      push_img = local_registry + "/" + image[1] + ":" + image[2]
      print("pushing " + push_img)
      client.images.push(push_img)
