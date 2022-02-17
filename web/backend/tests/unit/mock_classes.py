from app.models import Model

class MockWorker(Model):

    def __init__(self, name, hostname, pid, state, last_heart_beat,
                birth_date,successful_job_count,failed_job_count,total_working_time) -> None:
        self.name = name
        self.hostname = hostname
        self.pid = pid
        self.state = state
        self.last_heartbeat = last_heart_beat
        self.birth_date = birth_date
        self.successful_job_count = successful_job_count
        self.failed_job_count = failed_job_count
        self.total_working_time = total_working_time
        self.current_job = self.get_current_job()

    def get_current_job(self):

        return None

class MockJobID(Model):

    def __init__(self, job_id, redis_key) -> None:
        self.job_id = job_id
        self.redis_key = redis_key
