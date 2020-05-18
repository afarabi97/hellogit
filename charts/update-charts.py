#!/bin/python

import os
import subprocess
import requests
import yaml
import configparser

charts = [
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
                "version": "1.0.0"},
        { "name": "rocketchat",
                "version": "1.1.13"},
        { "name": "mongodb",
                "version": "7.2.10"},
        { "name": "nifi",
                "version": "1.0.0"},
        { "name": "redmine",
                "version": "1.0.0"},
        { "name": "mattermost",
                "version": "1.0.0"},
        { "name": "wikijs",
                "version": "1.0.0"},
        { "name": "misp",
                "version": "1.0.0"},
        { "name": "cortex",
                "version": "1.0.0"},
        { "name": "netflow-filebeat",
                "version": "1.0.0"},
        { "name": "squid",
                "version": "1.1.0"}
    ]


hostname = os.getenv('HOSTNAME')
domain = '.'.join(hostname.split('.')[1:])

CHARTMUSEUM_FQDN = "chartmuseum.{}".format(domain)
CHARTS_PATH="/opt/tfplenum/charts"
os.environ['REQUESTS_CA_BUNDLE'] = "/etc/pki/tls/certs/ca-bundle.crt"

CHARTS = '/opt/tfplenum/bootstrap/playbooks/group_vars/all/chartmuseum.yml'
INI = "/etc/tfplenum.ini"

def get_system_name():
    config = configparser.ConfigParser()
    config.read(INI)
    try:
        return config['tfplenum']['system_name']
    except KeyError:
        return None


def get_charts(system):
    with open(CHARTS) as file:
        charts = yaml.load(file, Loader=yaml.FullLoader)
    return charts['{}_charts'.format(system.lower())]


def get_chartmuseum_uri():
    return "https://" + CHARTMUSEUM_FQDN


def delete_chart(chartmuseum_uri, chart_name, chart_version):
    url = chartmuseum_uri + "/api/charts/" + chart_name + "/" + chart_version
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


def push_chart(chartmuseum_uri, chart_name, chart_version):
    chart_tar_path=CHARTS_PATH + "/" + chart_name + "/" + chart_name + "-" + chart_version + ".tgz"
    data = None
    if os.path.exists(chart_tar_path):
        data = open(chart_tar_path, 'rb')

    if data:
        url = chartmuseum_uri + "/api/charts"
        headers = {'Content-type': 'application/octet-stream'}
        r = requests.post(url, data=data, headers=headers)
        return r.status_code


def main():
    chartmuseum_uri = get_chartmuseum_uri()

    system_name = get_system_name()
    charts_to_update = get_charts(system_name)
    filtered_charts = filter(lambda chart: (chart['name'] in charts_to_update), charts)

    for chart in filtered_charts:
        print("Deleting " + chart["name"] + " " + chart["version"])
        delete_chart(chartmuseum_uri, chart["name"], chart["version"])
        is_packaged = package_chart(chart["name"], chart["version"])
        result = None
        if is_packaged:
            result = push_chart(chartmuseum_uri, chart["name"], chart["version"])

        if result:
            if (result == 200 or result ==201):
                print(chart["name"] + " updated successfully.")
        else:
            print(chart["name"] + "Update failed.")


if __name__ == '__main__':
    main()
