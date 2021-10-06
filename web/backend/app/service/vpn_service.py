from app.models.nodes import Node
from app.service.job_service import run_command2
from app.utils.constants import TEMPLATE_DIR
from jinja2 import Environment, FileSystemLoader, select_autoescape

WORKING_DIR = "/etc/openvpn"

JINJA_ENV = Environment(
    loader=FileSystemLoader([str(TEMPLATE_DIR), WORKING_DIR]),
    autoescape=select_autoescape(['html', 'xml'])
)

class VpnService():
    def __init__(self, node: Node, kitSettings: dict):
        self.node = node
        self.kitSettings = kitSettings
        self.short_hostname = None
        self.template_ctx = {}

    def sign_request(self):
        stdout, rtn_code = run_command2(working_dir=WORKING_DIR,
            command="./easyrsa --batch --req-cn={short_hostname} sign-req client {short_hostname} ".format(short_hostname=self.short_hostname),
            use_shell=True)

    def generate_key_request(self):
        stdout, rtn_code = run_command2(working_dir=WORKING_DIR,
            command="./easyrsa --batch --req-cn={short_hostname} gen-req {short_hostname} nopass".format(short_hostname=self.short_hostname),
            use_shell=True)

    def generate_client_file(self):
        filename = "{}/server/client-scripts/{}".format(WORKING_DIR, self.short_hostname)
        with open(filename, "w") as f:
            f.write("ifconfig-push {} {}".format(self.node.ip_address, self.kitSettings.netmask))
            f.write("\r\n")

    def generate_config(self) -> str:
        self.short_hostname = self.node.hostname.replace(".{domain}".format(domain=self.kitSettings.domain), "")
        self.generate_key_request()
        self.sign_request()
        self.generate_client_file()
        self.template_ctx["short_hostname"] = self.short_hostname
        template = JINJA_ENV.get_template('client.conf')
        cp_template = template.render(template_ctx=self.template_ctx)
        filename = "{}/{}.conf".format(WORKING_DIR, self.short_hostname)
        with open(filename, "w") as f:
            f.write(cp_template)
        return filename
