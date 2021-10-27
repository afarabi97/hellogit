from flask_restx.resource import Resource

from . import api
from app.service.system_info_service import get_version, get_build_date, get_commit_hash


@api.default_namespace.route('/version')
class VersionApi(Resource):
    def get(self) -> str:
        return {"version": get_version(), "build_date": get_build_date(), "commit_hash": get_commit_hash()}, 200
