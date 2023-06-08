import json
import time

from atlassian import Confluence
from datetime import datetime, timedelta
from time import sleep
from typing import List, Union, Dict
import requests
from requests import HTTPError

USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36'
ACCEPT_ENCODING = 'gzip, deflate, br'
ACCEPT_LANG = 'en-US,en;q=0.9'
HOST = 'confluence.levelup.cce.af.mil'
ORIGIN = 'https://confluence.levelup.cce.af.mil'

class PageNotFound(Exception):
    pass


class MyConfluenceExporter(Confluence):
    def __init__(self, url, bearer_token):
        self.bearer_token = bearer_token
        self.session = requests.Session()
        self.session.verify = False
        self.session.headers['Authorization']=str(f'Bearer {bearer_token}')
        self.default_headers['Authorization']=str(f'Bearer {bearer_token}')
        self.verify_ssl = False
        super().__init__(url, self.session)

    valid_formats = ("HTML", "PDF")
    session = None

    def _check_if_pdf_ready(self,
                            page_id: int,
                            export_hash: str) -> bool:
        headers = {'Accept': 'text/html, */*; q=0.01',
                   'User-Agent': USER_AGENT,
                   'X-Requested-With': 'XMLHttpRequest',
                   'X-Atlassian-Token': 'no-check',
                   'Authorization': f'Bearer {self.bearer_token}'}
        time_submitted = int(time.time() * 1000)
        poll_url = self.url + ("/plugins/contentexporter/"
                               "poll.action?pageId={page_id}&hash={pdfHash}&_={timeSubmitted}"
                                .format(page_id=page_id,
                                        pdfHash=export_hash,
                                        timeSubmitted=time_submitted))
        response = self._session.request(
            method='GET',
            url=poll_url,
            headers=headers,
            timeout=self.timeout,
            verify=self.verify_ssl
        )

        if response.status_code == 200:
            result = response.json()
            if result["ready"] and result["success"]:
                return True
            else:
                return False
        else:
            print(response.status_code)
        return False

    def _check_if_pdf_ready2(self,
                             export_job_id: str) -> str:
        headers = {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Encoding': ACCEPT_ENCODING,
            'Accept-Language': ACCEPT_LANG,
            'Connection': 'keep-alive',
            'Host': HOST,
            'User-Agent': USER_AGENT,
            'Authorization': f'Bearer {self.bearer_token}'
        }

        poll_url = self.url + ("/plugins/servlet/scroll-pdf/api/exports/"
                               "{exportPageId}/status"
                                .format(exportPageId=export_job_id))
        response = self._session.request(
            method='GET',
            url=poll_url,
            headers=headers,
            timeout=self.timeout,
            verify=self.verify_ssl
        )

        if response.status_code == 200:
            result = response.json()
            return result['downloadUrl']
        else:
            print("Failed to check PDF status with url: {} status_cod: {}".format(poll_url, response.status_code))

    def _wait_for_pdf(self,
                     page_id: int,
                     export_hash: str,
                     timeout_min: int) -> bool:
        start_time = datetime.utcnow()
        while True:
            if not self._check_if_pdf_ready(page_id, export_hash):
                print("Documentation not ready. Sleeping 5 seconds.")
                sleep(5)
            else:
                return True

            current_time = datetime.utcnow()
            if current_time > (start_time + timedelta(minutes=timeout_min)):
                print("Waiting for PDF timed out after %d." % timeout_min)
                break
        return False

    def _download_pdf(self, page_id: int, export_hash: str, export_path: str, export_version: str, export_format: str) -> str:
        headers = {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
            'Accept-Encoding': ACCEPT_ENCODING,
            'Accept-Language': ACCEPT_LANG,
            'Connection': 'keep-alive',
            'Host': HOST,
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': USER_AGENT,
            'X-Atlassian-Token': 'no-check',
            'Authorization': f'Bearer {self.bearer_token}'
        }
        file_to_save = ""
        download_url = self.url + ("/plugins/contentexporter/download.action"
                                   "?pageId={page_id}&hash={exportHash}"
                                   .format(page_id=page_id, exportHash=export_hash))
        with self._session.request(
            method='GET',
            url=download_url,
            headers=headers,
            timeout=self.timeout,
            verify=self.verify_ssl,
            stream=True
        ) as response:
            response.raise_for_status()

            file_to_save = "{}/DIP_{}_Manual.pdf".format(export_path, export_version)
            if export_format == MyConfluenceExporter.valid_formats[0]: # HTML format
                file_to_save = "{}/DIP_{}_HTML_Manual.zip".format(export_path, export_version)

            with open(file_to_save, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)

            print("Successfully exported documentation to {}".format(file_to_save))
        return file_to_save

    def _download_pdf3(self, page_id: int, export_path: str, export_version: str, timeout_min: int, title: str):
        url = f"{self.url}/spaces/flyingpdf/pdfpageexport.action?pageId={page_id}"
        file_to_save = ""
        success = False
        delay = 10
        attempt = 0
        while ((not success) and (attempt < 10)):
            attempt+=1
            try:
                with self._session.request(
                        method='GET',
                        url=url,
                        # headers=headers,
                        # timeout=self.timeout,
                        timeout=timeout_min * 60,
                        verify=self.verify_ssl,
                        stream=True
                    ) as response:
                        response.raise_for_status()
                        file_to_save = f"{export_path}/{title.replace(' ', '_')}_{export_version}_Manual.pdf"
                        success = True
                        with open(file_to_save, 'wb') as f:
                            for chunk in response.iter_content(chunk_size=8192):
                                if chunk:
                                    f.write(chunk)

                        print("Successfully exported documentation to {}".format(file_to_save), flush=True)
            except HTTPError as err:
                if(err.response.status_code==400 or err.response.status_code==500):
                    print(f"Server Status Code: {err.response.status_code}. Trying again in {delay} seconds.", flush=True)
                    sleep(delay)
                else:
                    raise err
        return file_to_save

    def _get_content_array(self, space: str, page_id: str, out_content: List[int]):
        pages = self.get_child_pages(page_id)
        for page in pages:
            out_content.append(int(page['id']))
            return self._get_content_array(space, page['id'], out_content)

    def _get_content_page_ids(self, space: str, title: str) -> List[int]:
        print(space)
        print(title)
        self.verify_ssl = False
        page = self.get_page_by_title(space, title)
        if page:
            content = [int(page['id'])]
            subcontent = self._get_content_array(space, page['id'], content)
            if(subcontent):
                content.append(subcontent)
            return content
        raise PageNotFound("{} does not exist in confluence. Did you type the page title exactly? \
                           Its case sensitive. Also, try surrounding it with double quotes on the command line.".format(title))

    def _export_page_w_children(self,
                               export_path: str,
                               export_version: str,
                               export_format: str,
                               title: str,
                               content: List[int],
                               space: str,
                               timeout_min) -> str:

        if export_format not in MyConfluenceExporter.valid_formats:
            raise ValueError("Invalid format passed in it can only be %s" % str(MyConfluenceExporter.valid_formats))

        page_id = content[0] # type: int
        headers = {
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'ORIGIN': ORIGIN,
            'X-Atlassian-Token': 'no-check',
            'User-Agent': USER_AGENT,
            'X-Requested-With': 'XMLHttpRequest',
            'Authorization': f'Bearer {self.bearer_token}'
        }

        export_params = {
            "contentId":content[0],"format":export_format,
            "content":content,"exportContentType":"ALL_CHILD","labels":"",
            "frontCover":None,"backCover":None,"toc":False,"tocTitle":"Table of Contents","tocLevel":1,"tocMode":"FLAT",
            "stylesheetId":0,"headerFooters":[],"pageSettings":{"size":"A4","width":0,"height":0,"orientation":"PORTRAIT"},
            "unit":"IN","margins":[{"top":1,"right":0.5,"bottom":1,"left":0.5,"pageSelector":"ALL"}],"profileId":None,
            "customProfileName":None,"fontResize":True,"breakWord":False,"separatePage":False,"useCustomFont":False,"selectedFont":None
        }

        file_path = ""
        export_params_str = json.dumps(export_params)
        payload = {'pageId': page_id, 'exportParametersJson': export_params_str}
        export_url = self.url + '/plugins/contentexporter/start-export.action'
        response = self._session.request(
            method='POST',
            url=export_url,
            headers=headers,
            timeout=self.timeout,
            verify=self.verify_ssl,
            data=payload
        )
        if response.status_code == 200:
            export_hash = response.json()['hash']
            self._wait_for_pdf(page_id, export_hash, timeout_min)
            file_path = self._download_pdf(page_id, export_hash, export_path, export_version, export_format)
        else:
            print("Page Export failed with status {}.".format(response.status_code))
        return file_path

    def export_single_page_pdf(self,
                               export_path: str,
                               export_version: str,
                               title: str,
                               space: str="THISISCVAH",
                               timeout_min: int=5) -> str:
        self.verify_ssl = False
        #print(self.default_headers)
        self._session.headers['Authorization']=f'Bearer {self.bearer_token}'
        main_page = self.get_page_by_title(space, title)
        if(main_page is None):
            print(f"Requested page: \"{title}\" not found.", flush=True)
            return None
        page_id = str(main_page['id'])
        ret.append(self._download_pdf3(page_id, export_path, export_version, timeout_min, title))
        if(sub_pages):
            pages = self.get_child_pages(page_id)
            for page in pages:
                ret.extend(self.export_single_page_pdf(export_path, export_version, page['title'], space, timeout_min, sub_pages))
        return ret

    def export_page_w_children(self,
                               export_path: str,
                               export_version: str,
                               export_format: str,
                               title: str,
                               space: str='THISISCVAH',
                               timeout_min: int=5):

        """
        Exports Page as a PDF with all of its nested children.

        :param export_path: The path we are going to the PDF manual to.
        :param export_version: The verion of our manual.
        :param export_format: The format of the export in question. Can be a list of all formats, if you want to export to everything or just an individual format
        :param title: The title of the page we which to export from.  Whatever title we specify it will only export that page with all of this children.
        :param space: The confluence space key.
        :param timeout_min: The amount of time in minutes this process will wait until it times outs during PDF export. (EX: 20 will time out after 20 minutes if the job has not completed).
        """
        if export_format not in ["HTML", "PDF"]:
            raise ValueError("Export format can only be alist or ")
        content = self._get_content_page_ids(space, title)
        return self._export_page_w_children(export_path,
                                            export_version,
                                            export_format,
                                            title,
                                            content,
                                            space,
                                            timeout_min)

    def set_permissions(self, title: str, space: str='THISISCVAH', is_restricted: bool=True):
        page_ids = self._get_content_page_ids(space, title)
        headers = {
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Accept-Encoding': ACCEPT_ENCODING,
            'Accept-Language': ACCEPT_LANG,
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Host': HOST,
            'ORIGIN': ORIGIN,
            'X-Atlassian-Token': 'no-check',
            'User-Agent': USER_AGENT,
            'X-Requested-With': 'XMLHttpRequest',
            'Authorization': 'Bearer {self.bearer_token}'
        }

        for page_id in page_ids:
            payload = {
                'viewPermissionsUsers': '',
                'editPermissionsUsers': '',
                'viewPermissionsGroups': '',
                'editPermissionsGroups': '',
                'contentId': page_id,
                'atl_token': 'f3b0c6403d442990e1b5c301a07bf536e148e91a'
            }

            if is_restricted:
                payload['editPermissionsGroups'] = 'THISISCVAH-Admin',

            setperms_url = self.url + '/pages/setcontentpermissions.action'
            response = self._session.request(
                method='POST',
                url=setperms_url,
                headers=headers,
                timeout=self.timeout,
                verify=self.verify_ssl,
                data=payload
            )

            if response.status_code == 200:
                print("Permissions changed for page id {}.".format(page_id))
                print(response.json())
            else:
                print("Failed with status code {}.".format(response.status_code))
