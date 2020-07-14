from kubernetes import client, config
from kubernetes.client.rest import ApiException
from datetime import datetime, timezone
import time
from dateutil import tz

class Jobs:

    def __init__(self):
        config.load_kube_config()
        self._v1 = client.BatchV1Api()
        # tz = time.tzname[time.daylight]
        self._currentTime = datetime.now(tz=tz.tzlocal())

    def _get_kubernetes_jobs(self):
        try:
            jobs = self._v1.list_job_for_all_namespaces(field_selector="status.successful==1", watch=False)
            return jobs
        except ApiException as e:
            print("Exception when calling BatchV1Api->list_job_for_all_namespaces: %s\n" % e)

    def _delete_jobs(self,job_list):
        for job in job_list.items:
            job_name = job.metadata.name
            # completionTime = datetime.strptime(job.status.completion_time, "%Y-%m-%dT%H:%M:%SZ")
            dateTimeDifference = self._currentTime - job.status.completion_time
            if(dateTimeDifference.total_seconds() >= 600):
                self._delete_job(job_name)

    def _delete_job(self,job_name):
        api_response = self._v1.delete_namespaced_job(
            name=job_name,
            namespace="default",
            body=client.V1DeleteOptions(
                propagation_policy='Foreground',
                grace_period_seconds=5))

def main():
    jobs = Jobs()
    job_list = jobs._get_kubernetes_jobs()
    jobs._delete_jobs(job_list)

if __name__ == "__main__":
    main()
