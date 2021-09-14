import json
import os
import sys
import subprocess
import yaml
import requests
from requests import Response
from argparse import ArgumentParser, Namespace
from subprocess import CompletedProcess
from pathlib import Path
from typing import List, Dict
from jinja2 import Environment, select_autoescape
from jinja2.loaders import FileSystemLoader


HELM_URL = "https://nexus.sil.lab/repository/tfplenum-helm"
SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
PROJECT_DIR = SCRIPT_DIR + "/../"
COMPONENTS_DIR = SCRIPT_DIR + "/components"


def eprint(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)


def run_command(command: str, cwd=SCRIPT_DIR) -> int:
    print(command)
    ret = subprocess.run(command, shell=True)  # type: CompletedProcess
    return ret.returncode


def download_file(url: str):
    print("Downloading {}".format(url))
    local_filename = url.split('/')[-1]
    # NOTE the stream=True parameter below
    with requests.get(url, stream=True, verify=False) as r:
        r.raise_for_status()
        with open(local_filename, 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192):
                # If you have chunk encoded response uncomment if
                # and set chunk_size parameter to None.
                #if chunk:
                f.write(chunk)
    return local_filename


class Builder:

    def __init__(self, name: str, nexus_user: str=None, nexus_password: str=None):
        self.component_name = name
        self.component_dir = COMPONENTS_DIR + "/" + self.component_name
        self.context = {}
        self.component = {}
        self._helm_name = ""
        self._helm_version = ""
        self._is_common_component = False
        self._set_context()
        self.context["name"] = name
        self._nexus_auth = (nexus_user, nexus_password)

        print("Jinja context set to:")
        print(json.dumps(self.context, indent=4, sort_keys=True))

        print("Jinja component set to:")
        print(json.dumps(self.component, indent=4, sort_keys=True))

        self.jinja2_environment = Environment(
            loader = FileSystemLoader(self.component_dir + "/templates"),
            # Explicitly configure as a security measure
            autoescape=select_autoescape()
        )

    def _set_context(self) -> Dict:
        yaml_dict = {}
        with open(SCRIPT_DIR + "/../versions.yml", "r") as stream:
            yaml_dict = yaml.safe_load(stream)

        jinja2_environment = Environment(
            loader = FileSystemLoader(SCRIPT_DIR + "/../"),
            # Explicitly configure as a security measure
            autoescape=select_autoescape()
        )
        template = jinja2_environment.get_template('versions.yml')
        rendered_template = template.render(yaml_dict)
        yaml_dict = yaml.safe_load(rendered_template)
        self.context = yaml_dict
        tokens = self.component_name.split('/')

        # Set the component
        self.component = self.context['custom_rpm_packages']
        for i, token in enumerate(tokens):
            if i == 0:
                for component in self.component:
                    if component["name"] == token:
                        self.component = component
                        break
            else:
                self.component = self.component[token]
                self.component["name"] = token

        # Set the helm and version information
        try:
            self._helm_name = self.component["name"]
            self._helm_version = self.component["helm_version"]
        except KeyError as e:
            # Common component is true when we dont have a helm version defined.
            # Common components are essentaily rpms with a docker container inside that are needed by non common components
            self._is_common_component = True
            for key in self.component:
                if "helm_version" in self.component[key]:
                    self._helm_name = key
                    self._helm_version = self.component[key]["helm_version"]
                    self._is_common_component = False

    def _process_template(self, template_name: str, dst:str="helm"):
        Path(f"{self.component_dir}/docker").mkdir(parents=True, exist_ok=True)
        template_path = Path(self.component_dir + "/templates/" + template_name)
        if not template_path.exists():
            print("{} does not exist. Skipping ...".format(template_path.name))
            return

        # Render file
        template = self.jinja2_environment.get_template(template_name)
        rendered_template = template.render(context=self.context, component=self.component)
        template_final_name = template_name[0: template_name.rfind(".")]
        # Write file
        with open(f"{self.component_dir}/{dst}/{template_final_name}", "w") as f:
            f.write(rendered_template)

    def _publish_helm(self):
        helm_file = self._helm_name + "-" + self._helm_version + ".tgz"
        url = HELM_URL + "/" + helm_file
        response = requests.put(url, data=open(helm_file, 'rb'), auth=self._nexus_auth, verify=False)
        if response.status_code == 400:
            eprint("Cannot override {} on the Nexus server".format(helm_file))
            exit(3)
        elif response.status_code != 200:
            eprint("Failed with for unknown reason with status code {}.".format(response.status_code))
            exit(3)

    def build_helm_chart(self):
        templates = ("values.yaml.j2", "Chart.yaml.j2")
        for template_name in templates:
            self._process_template(template_name)

        ret_code = run_command(f"helm package {self.component_dir}/helm")
        if ret_code != 0:
            eprint("Failed to package helm chart.")
            exit(ret_code)
        self._publish_helm()

    def build_docker_file(self):
        self._process_template("Dockerfile.j2", "docker")
        # Grab the first image in teh list and treat it like the main module
        image_path = self.component['containers'][0]
        ret_code = run_command(f"docker build -t {image_path} -f {self.component_dir}/docker/Dockerfile {self.component_dir}/docker/")
        if ret_code != 0:
            exit(ret_code)

        ret_code = run_command(f"docker image push {image_path}")
        exit(ret_code)

    def _helm_component_rpm_command(self, rpm_version: str, rpm_release_num: str, containers: str) -> str:
        rpm_name = self.component["name"]
        rpm_requirements = self.component["rpm_requirements"]
        return ('rpmbuild -bb --define="rpm_version {rpm_version}" '
                '--define="modules {containers}" '
                '--define="rpm_requires {rpm_requirements}" '
                '--define="helm_name {helm_name}" '
                '--define="rpm_name {rpm_name}" '
                '--define="helm_version {helm_version}" '
                '--define="artifact_dir {current_dir}" '
                '--define="release_ver {rpm_release_num}" '
                '--define="_binary_payload w2T16.xzdio" '
                'component-builder/common/rpm/helm.spec').format(rpm_version=rpm_version,
                                                                 containers=containers,
                                                                 rpm_requirements=rpm_requirements,
                                                                 helm_name=self._helm_name,
                                                                 rpm_name=rpm_name,
                                                                 helm_version=self._helm_version,
                                                                 current_dir=PROJECT_DIR,
                                                                 rpm_release_num=rpm_release_num)


    def _common_component_rpm_command(self, rpm_version: str, rpm_release_num: str, containers: str) -> str:
        rpm_requirements = self.component["rpm_requirements"]
        rpm_name = self.component["name"]

        return ('rpmbuild -bb '
                '--define="rpm_version {rpm_version}" '
                '--define="modules {containers}" '
                '--define="artifact_dir {current_dir}" '
                '--define="release_ver {rpm_release_num}" '
                '--define="rpm_requires {rpm_requirements}" '
                '--define="_binary_payload w2T16.xzdio" '
                '--define="rpm_name {rpm_name}" '
                'component-builder/common/rpm/common.spec').format(rpm_version=rpm_version,
                                                                   containers=containers,
                                                                   current_dir=PROJECT_DIR,
                                                                   rpm_release_num=rpm_release_num,
                                                                   rpm_requirements=rpm_requirements,
                                                                   rpm_name=rpm_name)

    def _download_helm_chart(self):
        url = HELM_URL + "/" + self._helm_name + "-" + self._helm_version + ".tgz"
        download_file(url)

    def _save_docker_containers(self) -> str:
        containers="empty"
        try:
            if len(self.component["containers"]) > 0:
                for container in self.component["containers"]:
                    ret_code = run_command("docker pull {}".format(container), PROJECT_DIR)
                    if ret_code != 0:
                        exit(ret_code)

                    tmp = container[container.rfind("/")+1:]
                    name = tmp[0:tmp.find(":")]
                    pos = container.rfind(":") + 1
                    version = container[pos:]
                    ret_code = run_command("docker save -o {name}-{version}.tar {docker_container}".format(name=name,
                                        version=version, docker_container=container), PROJECT_DIR)
                    if ret_code != 0:
                        exit(ret_code)
                containers = ' '.join(self.component['containers'])
        except KeyError:
            print("No containers to pull skipping ...")
        return containers

    def _publish_rpm(self, rpm_name: str, nexus_url: str):
        url = nexus_url + "/" + rpm_name
        response = requests.put(url, data=open(rpm_name, 'rb'), auth=self._nexus_auth, verify=False)
        if response.status_code == 400:
            eprint("Cannot override {} on the Nexus server".format(rpm_name))
            exit(3)
        elif response.status_code != 200:
            eprint("{} for unknown reason with status code {}.".format(url, response.status_code))
            exit(3)

    def build_rpm(self, rpm_version: str, rpm_release_num: str, nexus_url: str):
        containers = self._save_docker_containers()
        if not self._is_common_component:
            self._download_helm_chart()
            cmd = self._helm_component_rpm_command(rpm_version, rpm_release_num, containers)
        else:
            print("HELM chart not found.  The build is now assuming this is a common component build.")
            cmd = self._common_component_rpm_command(rpm_version, rpm_release_num, containers)

        ret_code = run_command(cmd, PROJECT_DIR)
        if ret_code != 0:
            exit(ret_code)

        ret_code = run_command("mv /root/rpmbuild/RPMS/x86_64/tfplenum-*.rpm .", PROJECT_DIR)
        if ret_code != 0:
            exit(ret_code)

        rpm_name="tfplenum-{}-{}-{}.el8.x86_64.rpm".format(self.component["name"], rpm_version, rpm_release_num)
        self._publish_rpm(rpm_name, nexus_url)


def get_all_components() -> List[str]:
    ret_val = []
    max_depth = 1
    for path, directories, files in os.walk(COMPONENTS_DIR):
        current_depth = path[len(COMPONENTS_DIR):].count(os.sep)
        if current_depth <= max_depth:
            # Add all directories at the first level
            if current_depth == 0:
                ret_val += directories
            else:
                pos = path.rfind(os.sep) + 1
                for directory in directories:
                    if directory != "helm" and directory != "templates" and directory != "docker":
                        ret_val.append(path[pos:] + os.sep + directory)

    return ret_val


def filter_helm_components(components: List[str]) -> List[str]:
    ret_val = []
    for component in components:
        p = Path(COMPONENTS_DIR + os.sep + component + os.sep + "templates")
        if p.exists():
            chart = Path(str(p) + "/Chart.yaml.j2")
            values = Path(str(p) + "/values.yaml.j2")
            if chart.exists() and values.exists():
                ret_val.append(component)
    return ret_val


def filter_docker_components(components: List[str]) -> List[str]:
    ret_val = []
    for component in components:
        p = Path(COMPONENTS_DIR + os.sep + component + os.sep + "templates")
        if p.exists():
            docker = Path(str(p) + "/Dockerfile.j2")
            if docker.exists():
                ret_val.append(component)
    return ret_val


class SubCmd:
    helm_build = 'helm-build'
    docker_build = 'docker-build'
    rpm_build = 'rpm-build'


def _add_common_args(parser: ArgumentParser):
    parser.add_argument('--nexus-user', dest='nexus_user', required=True,)
    parser.add_argument('--nexus-password', dest='nexus_password', required=True)


def main():
    components = get_all_components()
    docker_components = filter_docker_components(components)
    helm_components = filter_helm_components(components)
    parser = ArgumentParser(description="This application is used to build the various HELM chart components.")
    subparsers = parser.add_subparsers(help='commands')
    helm_parser = subparsers.add_parser(SubCmd.helm_build,
                                        help="This command is used build the helm charts \
                                              for the various components within the project.")
    helm_parser.set_defaults(which=SubCmd.helm_build)

    docker_parser = subparsers.add_parser(SubCmd.docker_build,
                                          help="This command is used to build the docker containres \
                                                for the various components within the project.")
    docker_parser.set_defaults(which=SubCmd.docker_build)

    rpm_parser = subparsers.add_parser(SubCmd.rpm_build,
                                       help="This command is used to build the RPM for the various components within the project.")
    rpm_parser.set_defaults(which=SubCmd.rpm_build)

    helm_parser.add_argument('-n', '--name', dest='name', required=True,
                             help="Builds a specified component.", choices=helm_components)

    docker_parser.add_argument('-n', '--name', dest='name', required=True,
                               help="Builds a specified component.", choices=docker_components)

    rpm_parser.add_argument('-n', '--name', dest='name', required=True,
                            help="Builds a specified component.", choices=components)
    rpm_parser.add_argument('-v', '--rpm-version', dest='rpm_version', required=True,
                            help="The RPM Version.")
    rpm_parser.add_argument('-r', '--rpm-release-num', dest='rpm_release_num', required=True,
                            help="The RPM Release number.")
    rpm_parser.add_argument('-u', '--nexus-url', dest='nexus_url', required=True,
                            help="The Nexus URL to publish to.")

    _add_common_args(helm_parser)
    _add_common_args(rpm_parser)

    args = parser.parse_args()
    try:
        if args.which == SubCmd.docker_build:
            if args.name == None:
                docker_parser.print_help()
            else:
                b = Builder(args.name)
                b.build_docker_file()
        if args.which == SubCmd.helm_build:
            if args.name == None:
                helm_parser.print_help()
            else:
                b = Builder(args.name, args.nexus_user, args.nexus_password)
                b.build_helm_chart()
        if args.which == SubCmd.rpm_build:
            if args.name == None:
                rpm_parser.print_help()
            else:
                b = Builder(args.name, args.nexus_user, args.nexus_password)
                b.build_rpm(args.rpm_version, args.rpm_release_num, args.nexus_url)
    except AttributeError:
        parser.print_help()


if __name__ == '__main__':
    main()
