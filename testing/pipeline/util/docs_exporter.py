import json
import time

from atlassian import Confluence
from datetime import datetime, timedelta
from time import sleep
from typing import List, Union, Dict

USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36'
ACCEPT_ENCODING = 'gzip, deflate, br'
ACCEPT_LANG = 'en-US,en;q=0.9'
HOST = 'confluence.di2e.net'
ORIGIN = 'https://confluence.di2e.net'

class PageNotFound(Exception):
    pass


class MyConfluenceExporter(Confluence):
    valid_formats = ("HTML", "PDF")

    def _check_if_pdf_ready(self,
                            page_id: int,
                            export_hash: str) -> bool:
        headers = {'Accept': 'text/html, */*; q=0.01',
                   'User-Agent': USER_AGENT,
                   'X-Requested-With': 'XMLHttpRequest',
                   'X-Atlassian-Token': 'no-check'}
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
            'User-Agent': USER_AGENT
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

    def _wait_for_pdf2(self,
                       export_job_id: int,
                       timeout_min: int) -> Union[None, str]:
        start_time = datetime.utcnow()
        while True:
            result = self._check_if_pdf_ready2(export_job_id)
            if not result:
                print("Documentation not ready. Sleeping 5 seconds.")
                sleep(5)
            else:
                return result

            current_time = datetime.utcnow()
            if current_time > (start_time + timedelta(minutes=timeout_min)):
                print("Waiting for PDF timed out after %d." % timeout_min)
                break
        return None

    def _download_pdf(self, page_id: int, export_hash: str, export_path: str, export_version: str, export_format: str) -> str:
        headers = {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
            'Accept-Encoding': ACCEPT_ENCODING,
            'Accept-Language': ACCEPT_LANG,
            'Connection': 'keep-alive',
            'Host': HOST,
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': USER_AGENT,
            'X-Atlassian-Token': 'no-check'
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

    def _download_pdf2(self, page_id: int, export_path: str, export_version: str, timeout_min: int, title: str) -> str:
        headers = {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Encoding': ACCEPT_ENCODING,
            'Accept-Language': ACCEPT_LANG,
            'Connection': 'keep-alive',
            'Content-Type': 'application/json;charset=UTF-8',
            'Host': HOST,
            'ORIGIN': ORIGIN,
            'User-Agent': USER_AGENT
        }

        payload = {
            "pageId": str(page_id),
            "pageSet":"current",
            "pageOptions":{

            },
            "templateId":"com.k15t.scroll.pdf.default-template-documentation",
            "locale":"en-US",
            "debugMode": False,
            "properties":{
                "labels":{
                    "includeContentWithLabels":[

                    ],
                    "excludeContentWithLabels":[

                    ],
                    "indexTerms":[

                    ]
                },
                "content":{
                    "headings":[
                        "enableNumberedHeadings"
                    ],
                    "layout":[

                    ],
                    "links":[
                        "enableExternalLinks",
                        "enableConfluenceLinks"
                    ],
                    "tables":[
                        "repeatTableHeaders"
                    ],
                    "pagebreak":[

                    ],
                    "comalaWorkflows":[

                    ],
                    "attachments":"notEmbedAttachments"
                },
                "macros":{
                    "macros":[

                    ]
                },
                "title":{
                    "figure":"after",
                    "table":"after"
                },
                "printOptions":{
                    "artifactFileName":"<span contenteditable=\"false\" draggable=\"false\" class=\"template-placeholder\" data-placeholder-app-key=\"com.k15t.scroll.pdf\" data-placeholder-key=\"document-title\" data-placeholder-velocity=\"${document.title}\" data-placeholder-name=\"Document Title\" data-placeholder-properties=\"{}\">Document Title</span>-v<span contenteditable=\"false\" draggable=\"false\" class=\"template-placeholder\" data-placeholder-app-key=\"com.k15t.scroll.pdf\" data-placeholder-key=\"document-revision\" data-placeholder-velocity=\"${document.rootPage.revision}\" data-placeholder-name=\"Document Revision\" data-placeholder-properties=\"{}\">Document Revision</span>-<span contenteditable=\"false\" draggable=\"false\" class=\"template-placeholder\" data-placeholder-app-key=\"com.k15t.scroll.pdf\" data-placeholder-key=\"export-date\" data-placeholder-velocity=\"${export.date(&amp;#x22;YYYMMdd_HHmmss&amp;#x22;)}\" data-placeholder-name=\"Export Date (YYYMMdd_HHmmss)\" data-placeholder-properties=\"{&amp;#x22;pattern&amp;#x22;:&amp;#x22;YYYMMdd_HHmmss&amp;#x22;}\">Export Date (YYYMMdd_HHmmss)</span>",
                    "optimization":[
                        "optimizePrint"
                    ],
                    "documentLinkSuffix":" (see page <span contenteditable=\"false\" draggable=\"false\" class=\"template-placeholder\" data-placeholder-app-key=\"com.k15t.scroll.pdf\" data-placeholder-velocity=\"${targetNumber}\"  data-placeholder-name=\"Target Number\">Target Number</span>)",
                    "figureLinkSuffix":" (see figure <span contenteditable=\"false\" draggable=\"false\" class=\"template-placeholder\" data-placeholder-app-key=\"com.k15t.scroll.pdf\" data-placeholder-velocity=\"${targetNumber}\"  data-placeholder-name=\"Target Number\">Target Number</span>)",
                    "tableLinkSuffix":" (see table ${targetNumber})",
                    "pdfCompliance":[

                    ],
                    "imageCompression":"none"
                },
                "metadata":{
                    "title":"",
                    "author":"",
                    "subject":"",
                    "keywords":""
                },
                "locale":{
                    "defaultLocale":"en"
                },
                "bookmarks":{
                    "level":"3",
                    "expandedLevel":"3",
                    "bookmarksPanel":[

                    ]
                }
            }
        }
        file_to_save = ""
        url = self.url + "/plugins/servlet/scroll-pdf/api/exports"
        response = self._session.request(
            method='POST',
            url=url,
            headers=headers,
            timeout=self.timeout,
            verify=self.verify_ssl,
            json=payload
        )
        if response.status_code == 200:
            payload = response.json()
            download_url = self._wait_for_pdf2(payload["exportJobId"], timeout_min)
            headers = {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
                'Accept-Encoding': ACCEPT_ENCODING,
                'Accept-Language': ACCEPT_LANG,
                'Connection': 'keep-alive',
                'Host': HOST,
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': USER_AGENT
            }

            with self._session.request(
                method='GET',
                url=download_url,
                headers=headers,
                timeout=self.timeout,
                verify=self.verify_ssl,
                stream=True
            ) as response:
                response.raise_for_status()
                file_to_save = "{}/{}_{}_Manual.pdf".format(export_path, title.replace(' ', '_'), export_version)
                with open(file_to_save, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk:
                            f.write(chunk)

                print("Successfully exported documentation to {}".format(file_to_save))
        else:
            print("Failed to initiate download with url: {} status_code: {}".format(url, response.status_code))
        return file_to_save

    def _get_content_array(self, space: str, page_id: str, out_content: List[int]):
        pages = self.get_child_pages(page_id)
        for page in pages:
            out_content.append(int(page['id']))
            self._get_content_array(space, page['id'], out_content)

    def _get_content_page_ids(self, space: str, title: str) -> List[int]:
        print(space)
        print(title)
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
                               space: str='THISISCVAH',
                               timeout_min: int=5) -> str:

        page = self.get_page_by_title(space, title)
        page_id = str(page['id'])
        return self._download_pdf2(page_id, export_path, export_version, timeout_min, title)

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
