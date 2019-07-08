import json
import time

from atlassian import Confluence
from datetime import datetime, timedelta
from time import sleep
from typing import List, Union


class PageNotFound(Exception):
    pass


class MyConfluenceExporter(Confluence):
    valid_formats = ("HTML", "PDF")

    def _check_if_pdf_ready(self,
                            page_id: int,
                            export_hash: str) -> bool:
        headers = {'Accept': 'text/html, */*; q=0.01',
                   'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.80 Safari/537.36',
                   'X-Requested-With': 'XMLHttpRequest',
                   'X-Atlassian-Token': 'no-check'}
        time_submitted = int(time.time() * 1000)
        poll_url = self.url + ("/plugins/contentexporter/"
                               "poll.action?pageId={pageId}&hash={pdfHash}&_={timeSubmitted}"
                                .format(pageId=page_id,
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
            if current_time > (start_time + timedelta(minutes=5)):
                print("Waiting for PDF timed out after %d." % timeout_min)
                break
        return False

    def _download_pdf(self, pageId: int, export_hash: str, export_path: str, export_version: str, export_format: str):
        headers = {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.9',
            'Connection': 'keep-alive',
            'Host': 'confluence.di2e.net',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.80 Safari/537.36',
            'X-Atlassian-Token': 'no-check'
        }
        download_url = self.url + ("/plugins/contentexporter/download.action"
                                   "?pageId={pageId}&hash={exportHash}"
                                   .format(pageId=pageId, exportHash=export_hash))
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

    def _get_content_array(self, space: str, page_id: str, out_content: List[int]):
        pages = self.get_child_pages(page_id)
        for page in pages:
            out_content.append(int(page['id']))
            self._get_content_array(space, page['id'], out_content)

    def _get_content_page_ids(self, space: str, title: str) -> List[int]:
        page = self.get_page_by_title(space, title)
        if page:
            content = [int(page['id'])]
            self._get_content_array(space, page['id'], content)
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
                               timeout_min):

        if export_format not in MyConfluenceExporter.valid_formats:
            raise ValueError("Invalid format passed in it can only be %s" % str(MyConfluenceExporter.valid_formats))

        page_id = content[0] # type: int
        headers = {
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Origin': 'https://confluence.di2e.net',
            'X-Atlassian-Token': 'no-check',
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.80 Safari/537.36',
            'X-Requested-With': 'XMLHttpRequest'
        }

        export_params = {
            "contentId":content[0],"format":export_format,
            "content":content,"exportContentType":"ALL_CHILD","labels":"",
            "frontCover":None,"backCover":None,"toc":False,"tocTitle":"Table of Contents","tocLevel":1,"tocMode":"FLAT",
            "stylesheetId":0,"headerFooters":[],"pageSettings":{"size":"A4","width":0,"height":0,"orientation":"PORTRAIT"},
            "unit":"IN","margins":[{"top":1,"right":0.5,"bottom":1,"left":0.5,"pageSelector":"ALL"}],"profileId":None,
            "customProfileName":None,"fontResize":True,"breakWord":False,"separatePage":False,"useCustomFont":False,"selectedFont":None
        }

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
            self._download_pdf(page_id, export_hash, export_path, export_version, export_format)
        else:
            print("Page Export failed with status {}.".format(response.status_code))

    def export_page_w_children(self,
                               export_path: str,
                               export_version: str,
                               export_format: Union[str, List[str]],
                               title: str,
                               space: str='THISISCVAH',
                               timeout_min: int=20):

        """
        Exports Page as a PDF with all of its nested children.

        :param export_path: The path we are going to the PDF manual to.
        :param export_version: The verion of our manual.
        :param export_format: The format of the export in question. Can be a list of all formats, if you want to export to everything or just an individual format
        :param title: The title of the page we which to export from.  Whatever title we specify it will only export that page with all of this children.
        :param space: The confluence space key.
        :param timeout_min: The amount of time in minutes this process will wait until it times outs during PDF export. (EX: 20 will time out after 20 minutes if the job has not completed).
        """

        if isinstance(export_format, str):
            content = self._get_content_page_ids(space, title)
            self._export_page_w_children(export_path, export_version, export_format, title, content, space, timeout_min)
        elif isinstance(export_format, list):
            content = self._get_content_page_ids(space, title)
            for fmt in export_format:
                self._export_page_w_children(export_path, export_version, fmt, title, content, space, timeout_min)
        else:
            raise ValueError("Export format can only be alist or ")

    def set_permissions(self, title: str, space: str='THISISCVAH', is_restricted: bool=True):
        page_ids = self._get_content_page_ids(space, title)
        headers = {
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.9',
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Host': 'confluence.di2e.net',
            'Origin': 'https://confluence.di2e.net',
            'X-Atlassian-Token': 'no-check',
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.80 Safari/537.36',
            'X-Requested-With': 'XMLHttpRequest'
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
