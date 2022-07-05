from app.models import Model


class MockJobLogModel(Model):

    def __init__(self, job_id: str, jobName: str, color: str, log: str) -> None:
        self.job_id = job_id
        self.redis_key = jobName
        self.color = color
        self.log = log
