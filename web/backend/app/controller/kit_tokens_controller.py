from app.middleware import handle_errors, login_required_roles
from app.models.common import COMMON_ERROR_MESSAGE, COMMON_SUCCESS_MESSAGE
from app.models.kit_tokens import KitTokenModel, KitTokenSchemaModel
from app.service.kit_tokens_service import (delete_kit_tokens, get_kit_tokens,
                                            post_kit_tokens)
from app.utils.namespaces import KIT_TOKEN_NS
from app.utils.validation import required_params
from flask import Response
from flask_restx import Resource


@KIT_TOKEN_NS.route("")
class KitTokensApi(Resource):

    @KIT_TOKEN_NS.doc(description="Get all kit tokens.")
    @KIT_TOKEN_NS.response(200, "List KitTokenModel", [KitTokenModel.DTO])
    @KIT_TOKEN_NS.response(500, "ErrorMessage: InternalServerError", COMMON_ERROR_MESSAGE)
    @login_required_roles(["controller-admin", "controller-maintainer"], all_roles_req=False)
    @handle_errors
    def get(self) -> Response:
        return get_kit_tokens()


    @KIT_TOKEN_NS.doc(description="Post a kit token from passed payload.")
    @KIT_TOKEN_NS.doc(payload=KitTokenModel)
    @KIT_TOKEN_NS.response(201, "KitTokenModel", KitTokenModel.DTO)
    @KIT_TOKEN_NS.response(409, "ErrorMessage: ResponseConflictError", COMMON_ERROR_MESSAGE)
    @KIT_TOKEN_NS.response(500, "ErrorMessage: InternalServerError", COMMON_ERROR_MESSAGE)
    @KIT_TOKEN_NS.expect(KitTokenModel.DTO)
    @login_required_roles(["controller-admin", "controller-maintainer"], all_roles_req=False)
    @required_params(KitTokenSchemaModel())
    @handle_errors
    def post(self) -> Response:
        return post_kit_tokens(KIT_TOKEN_NS.payload), 201


@KIT_TOKEN_NS.route("/<kit_token_id>")
@KIT_TOKEN_NS.doc(params={"kit_token_id": "A kit token used for delete"})
class KitTokensApi(Resource):

    @KIT_TOKEN_NS.doc(description="Delete a kit token by ID.")
    @KIT_TOKEN_NS.response(200, "SuccessMessage", COMMON_SUCCESS_MESSAGE)
    @KIT_TOKEN_NS.response(404, "ErrorMessage: NotFoundError", COMMON_ERROR_MESSAGE)
    @KIT_TOKEN_NS.response(500, "ErrorMessage: InternalServerError", COMMON_ERROR_MESSAGE)
    @login_required_roles(["controller-admin", "controller-maintainer"], all_roles_req=False)
    @handle_errors
    def delete(self, kit_token_id: str) -> Response:
        return delete_kit_tokens(kit_token_id)
