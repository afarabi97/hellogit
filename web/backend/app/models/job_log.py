from app.models import Model
from app.utils.namespaces import JOB_NS
from flask_restx import fields


class JobLogModel(Model):
    DTO = JOB_NS.model('JobLogModel', {
        "color": fields.String(required=True, example="white", description="Color used in displaying the log line."),
        "jobName": fields.String(required=True, example="Nodes", description="Name associated with the current job."),
        "jobid": fields.String(required=True, example="16d8e8fe-d462-41ae-94e5-6675b60b2be3", description="Jobid for the logs."),
        "log": fields.String(required=True, example="TASK [Run gather facts] ***", description="The log or line entry in a terminal.")
    })
