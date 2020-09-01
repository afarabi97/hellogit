# coding: utf-8
import argparse
import getpass
import datetime
import json
import keyring
import requests
import lxml.html
import sys, os
import re
import pandas as pd
from datetime import datetime
from lxml.html import HtmlElement
from typing import List
import base64

# Globals

BASE_URL = "/rest/api/content"
VIEW_URL = "/pages/viewpage.action?pageId="
USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.82 Safari/537.36"
CONTENT_TYPE = "application/json"
date = datetime.now()
current_date = date.today().strftime("%m/%d/%Y")
current_time = date.today().strftime("%H:%M:%S")
input_username = str(sys.argv[2])
input_password = sys.argv[4] #change input_password to = str(sys.argv[4]) if using text-based password;
                             #else leave as sys.argv[4]
branch_name = str(sys.argv[6])
sonar_link = str(sys.argv[8])
quality_gate_status = str(sys.argv[10])
total_scan_time = str(sys.argv[12])
project_Key = str(sys.argv[14])

DEVEL_PAGE_ID = 849576805 #<-Keep this static; refers to Confluence page with table
MASTER_PAGE_ID = 853279989 #<-Keep this static; refers to Confluence page with table
FEATURE_PAGE_ID = 853280003 #<-Keep this static; refers to Confluence page with table

def return_branch(branch_name):
    if re.match('devel', branch_name):
        return DEVEL_PAGE_ID
    elif re.match('master', branch_name):
        return MASTER_PAGE_ID
    else:
        return FEATURE_PAGE_ID

def b64decode_string(input_password):
    ret_val = base64.b64decode(input_password.encode())
    return ret_val.decode('utf-8')

def get_page_ancestors(auth, page_id, server):
    url = "{server}{base}/{page_id}?expand=ancestors".format(
        server=server, base=BASE_URL, page_id=page_id
    )
    try:
        r = requests.get(
        url,
        auth=auth,
        headers={"Content-Type": CONTENT_TYPE, "USER-AGENT": USER_AGENT},
    )
        return r.json()["ancestors"]
    except Exception as e:
        print("No Page Ancestors: ", e)
        sys.exit(0)


def get_page_info(auth, page_id, server):
    url = "{server}{base}/{page_id}".format(
        server=server, base=BASE_URL, page_id=page_id
    )
    try:
        r = requests.get(
        url,
        auth=auth,
        headers={"Content-Type": CONTENT_TYPE, "USER-AGENT": USER_AGENT},
    )
        return r.json()
    except Exception as e:
        print("No Page: ", e)
        sys.exit(0)



def convert_db_to_view(auth2, html, server):
    url = "{server}/rest/api/contentbody/convert/view".format(server=server)
    data2 = {"value": html, "representation": "storage"}
    try:
        r = requests.post(
        url,
        data=json.dumps(data2),
        auth=auth2,
        headers={"Content-Type": CONTENT_TYPE},
    )
        return r.json()
    except Exception as e:
        print("Can't Convert page to dbview: ", e)
        sys.exit(0)


def convert_view_to_db(auth2, html, server):
    url = "{server}/rest/api/contentbody/convert/storage".format(server=server)
    data2 = {"value": html, "representation": "editor"}
    try:
        r = requests.post(
        url,
        data=json.dumps(data2),
        auth=auth2,
        headers={"Content-Type": CONTENT_TYPE},
    )
        return r.json()
    except Exception as e:
        print("Can't Convert view to db: ", e)
        sys.exit(0)


def write_data(auth, html, page_id, server):
    try:
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
        r = requests.put(url, data=data, auth=auth, headers=our_headers)
        print("Visit scan results: https://confluence.di2e.net/pages/viewpage.action?pageId=%d" % (page_id))
        return r
    except Exception as e:
        print("Unable to write data to page: ", e)
        sys.exit(0)


def read_data(auth, page_id, server):
    url = "{server}{base}/{page_id}?expand=body.storage".format(
        server=server, base=BASE_URL, page_id=page_id
    )
    try:
        r = requests.get(
        url,
        auth=auth,
        headers={"Content-Type": CONTENT_TYPE, "USER-AGENT": USER_AGENT},
    )
        return r
    except Exception as e:
        print("Unable to read data: ", e)
        sys.exit(0)


def patch_html2(auth, options):
    json_text = read_data(auth, options.page_id, options.server).text
    json2 = json.loads(json_text)
    html_storage_txt = json2["body"]["storage"]["value"]
    html = lxml.html.fromstring(html_storage_txt)
    table_body = html.find(".//tbody")
    time = globals()["current_time"]
    date = globals()["current_date"]
    branch = globals()["branch_name"]
    link = globals()["sonar_link"]
    quality_gate = globals()["quality_gate_status"]
    tot_scan_time = globals()["total_scan_time"]
    pkey = globals()["project_Key"]
    my_custom_row = f"""<tr role="row">
        <td class="confluenceTd" style="text-align: center;" colspan="1" data-mce-style="text-align: center;">{date}</td>
        <td class="confluenceTd" style="text-align: center;" colspan="1" data-mce-style="text-align: center;">{time}</td>
        <td class="confluenceTd" style="text-align: center;" colspan="1" data-mce-style="text-align: center;">{branch}</td>
        <td class="confluenceTd" style="text-align: center;" colspan="1" data-mce-style="text-align: center;">{pkey}</td>
        <td class="confluenceTd" style="text-align: center;" colspan="1" data-mce-style="text-align: center;"><a class="external-link" href="{link}" rel="nofollow">{link}</a></td>
        <td class="confluenceTd" style="text-align: center;" colspan="1" data-mce-style="text-align: center;">{quality_gate}</td>
        <td class="confluenceTd" style="text-align: center;" colspan="1" data-mce-style="text-align: center;">{tot_scan_time}</td>
        </tr>"""

    new_row = lxml.html.fromstring(my_custom_row)
    table_body.insert(1, new_row)
    html_string = lxml.html.tostring(html, pretty_print=False).decode("utf-8")
    json2["body"]["storage"]["value"] = html_string
    write_data(auth, json2["body"]["storage"]["value"], options.page_id, options.server)


def get_login():
    username = globals()["input_username"]
    #password = globals()["input_password"] # uncomment if using a text-based input
    pw = globals()["input_password"] #comment-out if using a masked-object input
    password = b64decode_string(pw) #comment-out if using a masked-object input
    return username, password

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "-u",
        "--user",
        default="",
        required=True,
        help="Specify the username to log into Confluence"
    )
    parser.add_argument(
        "-pw",
        "--pass",
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
        default=return_branch(branch_name),
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
    options = parser.parse_args()
    if options.server.endswith("/"):
        options.server = options.server[:-1]
    auth = get_login()
    patch_html2(auth, options)


if __name__ == "__main__":
    main()
