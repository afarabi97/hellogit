# coding: utf-8
import argparse
import datetime
import json
import requests
import lxml.html
import os
import re
from argparse import Namespace
from datetime import datetime
from lxml.html import HtmlElement
from typing import Tuple
import base64

# Globals:
PAGE_SERVER = "https://confluence.di2e.net"
BASE_URL = "/rest/api/content"
VIEW_URL = "/pages/viewpage.action?pageId="
USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.82 Safari/537.36"
CONTENT_TYPE = "application/json"
CURRENT_DATE_TIME = datetime.now()
CURRENT_DATE = CURRENT_DATE_TIME.today().strftime("%m/%d/%Y")
CURRENT_TIME = CURRENT_DATE_TIME.today().strftime("%H:%M:%S")

# Confluence Page ID; Keep these static; refers to Confluence page with table:
DEVEL_PAGE_ID = 849576805
MASTER_PAGE_ID = 853279989
FEATURE_PAGE_ID = 853280003


def return_pageid(branch_name: str) -> int:
    if re.match('devel', branch_name):
        return DEVEL_PAGE_ID
    elif re.match('master', branch_name):
        return MASTER_PAGE_ID
    else:
        return FEATURE_PAGE_ID


def b64decode_string(input_password: str) -> str:
    ret_val = base64.b64decode(input_password.encode())
    return ret_val.decode('utf-8')


def get_page_ancestors(auth: Tuple[str, str], page_id: int, server: str):
    url = "{server}{base}/{page_id}?expand=ancestors".format(
        server=server, base=BASE_URL, page_id=page_id
    )
    request = requests.get(
        url,
        auth=auth,
        headers={"Content-Type": CONTENT_TYPE, "USER-AGENT": USER_AGENT},
    )
    return request.json()["ancestors"]


def get_page_info(auth: Tuple[str, str], page_id: int, server: str):
    url = "{server}{base}/{page_id}".format(
        server=server, base=BASE_URL, page_id=page_id
    )
    request = requests.get(
        url,
        auth=auth,
        headers={"Content-Type": CONTENT_TYPE, "USER-AGENT": USER_AGENT},
    )
    return request.json()


def convert_db_to_view(auth2: Tuple[str, str], html: str, server: str):
    url = "{server}/rest/api/contentbody/convert/view".format(server=server)
    data2 = {"value": html, "representation": "storage"}

    request = requests.post(
        url,
        data=json.dumps(data2),
        auth=auth2,
        headers={"Content-Type": CONTENT_TYPE},
    )
    return request.json()


def convert_view_to_db(auth2: Tuple[str, str], html: str, server: str):
    url = "{server}/rest/api/contentbody/convert/storage".format(server=server)
    data2 = {"value": html, "representation": "editor"}
    request = requests.post(
        url,
        data=json.dumps(data2),
        auth=auth2,
        headers={"Content-Type": CONTENT_TYPE}
    )
    return request.json()


def write_data(auth: Tuple[str, str], html: str, page_id: int, server: str):
    info = get_page_info(auth, page_id, server)
    ver = int(info["version"]["number"]) + 1
    ancestors = get_page_ancestors(auth, page_id, server)
    anc = ancestors[-1]
    del anc["_links"]
    del anc["_expandable"]
    del anc["extensions"]
    data = {
        "id": str(page_id),
        "type": "page",
        "title": info["title"],
        "version": {"number": ver},
        "ancestors": [anc],
        "body": {"storage": {"representation": "editor", "value": str(html),}},
    }
    data = json.dumps(data)
    url = "{server}{base}/{page_id}".format(
        server=server, base=BASE_URL, page_id=page_id
    )
    our_headers = {"Content-Type": CONTENT_TYPE, "USER-AGENT": USER_AGENT}
    return requests.put(url, data=data, auth=auth, headers=our_headers)


def read_data(auth: Tuple[str, str], page_id: int, server: str):
    url = "{server}{base}/{page_id}?expand=body.storage".format(
        server=server, base=BASE_URL, page_id=page_id
    )
    return requests.get(url, auth=auth, headers={"Content-Type": CONTENT_TYPE, "USER-AGENT": USER_AGENT})

def get_pic_file_name(filename: str):
    function = os.path.basename(filename)
    return function


def patch_html2(auth: Tuple[str, str], args: Namespace):
    branch = args.branch_name
    page_id = return_pageid(branch)
    json_text = read_data(auth, args.page_id, args.server).text
    json2 = json.loads(json_text)
    html_storage_txt = json2["body"]["storage"]["value"]
    html = lxml.html.fromstring(html_storage_txt)
    table_body = html.find(".//tbody")
    time = CURRENT_TIME
    date = CURRENT_DATE
    link = args.sonar_link
    quality_gate = args.quality_gate_status
    tot_scan_time = args.total_scan_time
    pkey = args.project_key
    scan_pic_name = get_pic_file_name(args.screen_shot)
    my_custom_row = f"""<tr>
        <td colspan="1" style="text-align: center;">{date}</td>
        <td colspan="1" style="text-align: center;">{time}</td>
        <td colspan="1" style="text-align: center;">{branch}</td>
        <td colspan="1" style="text-align: center;">{pkey}</td>
        <td colspan="1" style="text-align: center;"><a class="external-link" href="{link}" rel="nofollow">{link}</a></td>
        <td colspan="1" style="text-align: center;">{quality_gate}</td>
        <td colspan="1" style="text-align: center;">{tot_scan_time}</td>
        <td colspan="1" style="text-align: center;" class="confluenceTd">
        <div class="content-wrapper"><p><img height="250" src="/download/attachments/{page_id}/{scan_pic_name}"
        data-image-height="393" data-image-width="611"></p></div></td>
        </tr>"""

    new_row = lxml.html.fromstring(my_custom_row)
    table_body.insert(1, new_row)
    html_string = lxml.html.tostring(html, pretty_print=False).decode("utf-8")
    json2["body"]["storage"]["value"] = html_string
    write_data(auth, json2["body"]["storage"]["value"], args.page_id, args.server)


def upload_image(auth: Tuple[str, str], screen_shot: str, branch_name: str):
    pg_id = return_pageid(branch_name)
    url = "{server}{base}/{page_id}".format(
        server=PAGE_SERVER, base=BASE_URL, page_id= pg_id
    ) + '/child/attachment'
    headers = {"X-Atlassian-Token": "nocheck"}
    content_type = 'image/jpeg'
    files = {'file': (screen_shot, open(screen_shot, 'rb'),content_type)} #assumes file is in same dir
    requests.post(url, headers=headers, files=files, auth=auth)


def get_login(args: Namespace) -> Tuple[str, str]:
    username = args.username
    passed_code = args.password
    password = b64decode_string(passed_code) #comment-out if using a masked-object input
    return username, password


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "-u",
        "--user",
        default="",
        dest="username",
        required=True,
        help="Specify the username to log into Confluence"
    )
    parser.add_argument(
        "-pw",
        "--pass",
        dest="password",
        default="",
        required=True,
        help="Specify the userpassword to log into Confluence"
    )
    parser.add_argument(
        "-s",
        "--server",
        default="https://confluence.di2e.net",
        required=False,
        help="Confluence Server Page; EX: https://yoursitename.com"
    )
    parser.add_argument(
        "-pg",
        "--page-id",
        dest="page_id",
        default=DEVEL_PAGE_ID,
        required=False,
        type=int,
        help="Specify the Confluence page ID to Write onto; Found on address-bar, when on confluence page edit"
    )
    parser.add_argument(
        "-b",
        "--branch",
        dest="branch_name",
        default="",
        required=True,
        type=str,
        help="Specify the Gitlab Branch Name: Ex: devel, feature/THISISCVAH-1111"
    )
    parser.add_argument(
        "-l",
        "--link",
        dest="sonar_link",
        default="http://sonarqube.sil.lab",
        required=True,
        type=str,
        help="Specify the Sonar Scan results link; EX: http://sonar.sil.lab/"
    )
    parser.add_argument(
        "-gs",
        "--gate-status",
        dest="quality_gate_status",
        default="",
        required=True,
        type=str,
        help="Gate Status: PASS/FAIL"
    )
    parser.add_argument(
        "-tt",
        "--total-time",
        dest="total_scan_time",
        default="",
        required=True,
        type=str,
        help="Scan Time in minutes"
    )
    parser.add_argument(
        "-pk",
        "--project-key",
        dest="project_key",
        default="",
        required=True,
        type=str,
        help="Project Key"
    )
    parser.add_argument(
        "-ss",
        "--screen-shot",
        dest="screen_shot",
        default="",
        required=True,
        type=str,
        help="Screenshot to upload"
    )
    args = parser.parse_args()
    if args.server.endswith("/"):
        args.server = args.server[:-1]
    auth = get_login(args)
    upload_image(auth, args.screen_shot, args.branch_name)
    patch_html2(auth, args)

if __name__ == "__main__":
    main()
