from app.models import Model
from app.utils.namespaces import VERSION_NS
from flask_restx import fields


class VersionInformationModel(Model):
    DTO = VERSION_NS.model('VersionInformationModel', {
        "version": fields.String(example="3.7.0",
                                 description="The version number."),
        "build_date": fields.String(example="June 09, 2022",
                                    description="The date the version was released."),
        "commit_hash": fields.String(example="48d1ce15",
                                     description="The build hash.")
    })

    def __init__(self, version: str, build_date: str, commit_hash: str):
        self.DTO["version"] = version
        self.DTO["build_date"] = build_date
        self.DTO["commit_hash"] = commit_hash
