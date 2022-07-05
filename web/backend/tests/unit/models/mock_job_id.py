from app.models import Model


class MockJobIDModel(Model):

    def __init__(self, job_id, redis_key) -> None:
        self.job_id = job_id
        self.redis_key = redis_key


class MockJobIDModel2(Model):

    def __init__(self) -> None:
        self.job_id = 'bd19eeb80-5499-4223-8685-a5103bcf47e8'
        self.redis_key = 'rq:job:bd19eeb80-5499-4223-8685-a5103bcf47e8'
