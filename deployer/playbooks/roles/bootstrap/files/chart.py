import os
import re
import sys
import yaml
import docker
import logging
import os.path
import tarfile
import subprocess
from os import path
from os import listdir
from os.path import isfile, join
from pyhelm.chartbuilder import ChartBuilder

def get_charts(dir):
    files = [f for f in listdir(dir) if isfile(join(dir, f))]
    return files

def get_chart_name(members):
    for member in members:
        if member.isreg() and "Chart.yaml" in member.name:
            f = tarfile.open(tar)
            f = f.extractfile(member)
            stream = f.read()
            data = yaml.load(stream)
            name = data["name"]
            f.close()
            return name

def get_tar_members(tar):
    f = tarfile.open(tar)
    members = f.getmembers()
    f.close()
    return members

def extract_chart(tar):
    f = tarfile.open(tar)
    f.extractall(path="charts")
    f.close()

dir = sys.argv[1]
client = docker.from_env()
local_registry = "localhost:5000"
charts = get_charts(dir)

if not os.path.exists("executed_charts"):
    print("creating chart path")
    os.mkdir("executed_charts")
else:
    print("Chart path already exists")

for chart in charts:
    tar = dir + chart
    members = get_tar_members(tar)
    chart_name = get_chart_name(members)
    extract_chart(tar)
    files = os.listdir("charts/" + chart_name + "/templates")
    for file in files:
        path = "charts/" + chart_name + "/templates/" + file
        if os.path.isfile(path):
            f = open(path)
            contents = f.readlines()
            for line in contents:
                if "kind: Deployment" in line or "kind: StatefulSet" in line or "kind: DaemonSet" in line or "kind: CronJob" in line:
                    subprocess.call(['/usr/local/bin/helm', 'template', 'charts/' + chart_name, '--debug', '--output-dir=./executed_charts', '-x' + 'templates/' + file])

images = []
for root, directories, filenames in os.walk('executed_charts/'):
    for filename in filenames:
        path = os.path.join(root,filename)
        f = open(path)
        contents = f.readlines()
        for line in contents:
            if "image:" in line:
                a = line.strip()
                pat = re.compile("image:.*")
                res = pat.findall(a)
                s = res[0]
                s = s.split(" ")
                s = s[1]
                s = s.strip('\"')
                s = s.strip("\'")
                if s != ":":
                    if s not in images:
                        images.append(s)

for image in images:
    if ":" not in image:
        tag = "latest"
    if ":" in image:
        repo = image.split(":")[0]
        tag = image.split(":")[1]
        pat = re.compile("^[^/]*")
        res = pat.match(repo)
        if "." in res.group(0):
            registry = res.group(0)
            repo = str(repo).split("/",1)[1]
        else:
            registry = "docker.io"
        try:
            print("Pulling " + registry + "/" + repo + ":" + tag)
            client.images.pull(registry + "/" + repo,  tag=tag)
            if "." in res.group(0):
                img = client.images.get(registry + "/" + repo + ":" + tag)
            else:
                img = client.images.get(repo + ":" + tag)
            print("Tagging " + local_registry + "/" + repo + ":" + tag)
            img.tag(local_registry + "/" + repo + ":" + tag)
            push_img = local_registry + "/" + repo + ":" + tag
            print("pushing " + push_img)
            client.images.push(push_img)
        except:
            print("Skipping " + registry + "/" + repo + ":" + tag)
            pass
