from app.middleware import (controller_maintainer_required, handle_errors,
                            login_required_roles)
from app.models.common import COMMON_ERROR_MESSAGE, COMMON_SUCCESS_MESSAGE
from app.models.scale import (ElasticScaleAdvancedConfigModel,
                              ElasticScaleAdvancedConfigSchema,
                              ElasticScaleCheckModel, ElasticScaleNodeInModel,
                              ElasticScaleNodeInSchema,
                              ElasticScaleNodeOutModel)
from app.service.scale_service import (get_elastic_scale_advanced,
                                       get_elastic_scale_check,
                                       get_elastic_scale_nodes,
                                       post_elastic_scale,
                                       post_elastic_scale_advanced)
from app.utils.namespaces import SCALE_NS
from app.utils.validation import required_params
from flask import Response
from flask_restx.resource import Resource


@SCALE_NS.route("/check")
class ScaleCheckCtrlApi(Resource):

    @SCALE_NS.doc(description="Gets elastic node status.")
    @SCALE_NS.response(200, "ElasticScaleCheckModel", ElasticScaleCheckModel.DTO)
    @SCALE_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @login_required_roles()
    @handle_errors
    def get(self) -> Response:
        return get_elastic_scale_check()


@SCALE_NS.route("/elastic")
class ScaleElasticCtrlApi(Resource):

    @SCALE_NS.doc(description="Post all elastic nodes and counts.")
    @SCALE_NS.doc(payload=ElasticScaleNodeInModel)
    @SCALE_NS.response(200, "SuccessMessage", COMMON_SUCCESS_MESSAGE)
    @SCALE_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @SCALE_NS.expect(ElasticScaleNodeInModel.DTO)
    @required_params(ElasticScaleNodeInSchema())
    @controller_maintainer_required
    @handle_errors
    def post(self) -> Response:
        return post_elastic_scale(SCALE_NS.payload)


@SCALE_NS.route("/elastic/advanced")
class ScaleAdvancedCtrlApi(Resource):

    @SCALE_NS.doc(description="Get elastic advanced.")
    @SCALE_NS.response(200, "ElasticScaleAdvancedConfigModel", ElasticScaleAdvancedConfigModel.DTO)
    @SCALE_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @login_required_roles()
    @handle_errors
    def get(self) -> Response:
        return get_elastic_scale_advanced()


    @SCALE_NS.doc(description="Post elastic advanced.")
    @SCALE_NS.doc(payload=ElasticScaleAdvancedConfigModel)
    @SCALE_NS.response(200, "SuccessMessage", COMMON_SUCCESS_MESSAGE)
    @SCALE_NS.response(406, "ErrorMessage: ObjectKeyError", COMMON_ERROR_MESSAGE)
    @SCALE_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @SCALE_NS.expect(ElasticScaleAdvancedConfigModel.DTO)
    @required_params(ElasticScaleAdvancedConfigSchema())
    @controller_maintainer_required
    @handle_errors
    def post(self) -> Response:
        return post_elastic_scale_advanced(SCALE_NS.payload)


@SCALE_NS.route("/elastic/nodes")
class ElasticNodeCountCtrlApi(Resource):

    @SCALE_NS.doc(description="Get all elastic nodes counts.")
    @SCALE_NS.response(200, "ElasticScaleNodeOutModel", ElasticScaleNodeOutModel.DTO)
    @SCALE_NS.response(500, "ErrorMessage", COMMON_ERROR_MESSAGE)
    @login_required_roles()
    @handle_errors
    def get(self) -> Response:
        return get_elastic_scale_nodes()
