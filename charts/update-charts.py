#!/bin/python

import os
import subprocess
import requests

charts = [
        { "name": "endgame2elastic",
                "version": "1.0.0"},
        { "name": "logstash",
                "version": "1.0.0"},
        { "name": "moloch",
                "version": "1.0.0"},
        { "name": "moloch-viewer",
                "version": "1.0.0"},
        { "name": "suricata",
                "version": "1.0.0"},
        { "name": "zeek",
                "version": "1.0.0"},
        { "name": "hive",
                "version": "1.0.0"}
    ]

CHARTMUSEUM_PORT="8080"
CHARTS_PATH="/opt/tfplenum/charts"

def get_chartmuseum_ip():
    cmd=("kubectl get svc | grep chartmuseum | awk '{ print $4 }'")
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, shell=True)
    return proc.stdout.readline().decode().strip()


def delete_chart(chartmuseum_svc_ip, chart_name, chart_version):
    url = "http://" + chartmuseum_svc_ip + ":8080" + "/api/charts/" + chart_name + "/" + chart_version
    r = requests.delete(url)


def package_chart(chart_name, chart_version):
    # Remove old compiled chart tgz
    chart_tar_path=CHARTS_PATH + "/" + chart_name + "/" + chart_name + "-" + chart_version + ".tgz"
    if os.path.exists(chart_tar_path):
        print("Deleting old " + chart_name + " chart tgz")
        os.remove(chart_tar_path)
    # Compile new chart tgz
    cmd=("helm package " + CHARTS_PATH + "/" + chart_name + " -d " + CHARTS_PATH + "/" + chart_name)
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, shell=True)
    print(proc.stdout.readline().decode().strip())
    if os.path.exists(chart_tar_path):
        return True
    return False


def push_chart(chartmuseum_svc_ip, chart_name, chart_version):
    chart_tar_path=CHARTS_PATH + "/" + chart_name + "/" + chart_name + "-" + chart_version + ".tgz"
    data = None
    if os.path.exists(chart_tar_path):
        data = open(chart_tar_path, 'rb')

    if data:
        url = "http://" + chartmuseum_svc_ip + ":" + CHARTMUSEUM_PORT + "/api/charts"
        headers = {'Content-type': 'application/octet-stream'}
        r = requests.post(url, data=data, headers=headers)
        return r.status_code


def main():
    chartmuseum_svc_ip = get_chartmuseum_ip()
    for chart in charts:
        print("Deleting " + chart["name"] + " " + chart["version"])
        delete_chart(chartmuseum_svc_ip, chart["name"], chart["version"])
        is_packaged = package_chart(chart["name"], chart["version"])
        result = None
        if is_packaged:
            result = push_chart(chartmuseum_svc_ip, chart["name"], chart["version"])

        if result:
            if (result == 200 or result ==201):
                print(chart["name"] + " updated successfully.")
        else:
            print(chart["name"] + "Update failed.")


if __name__ == '__main__':
    main()
