from flask_restx import Namespace, fields

TOKEN_NS = Namespace("token", description="Kit tokens used for metrics.")

IP_ADDRESS_PATTERN = "^(0|[1-9][0-9]?|1[0-9]{2}|2[0-5][0-5])\.(0|[1-9][0-9]?|1[0-9]{2}|2[0-5][0-5])\.(0|[1-9][0-9]?|1[0-9]{2}|2[0-5][0-5])\.(0|[1-9][0-9]?|1[0-9]{2}|2[0-5][0-5])$"

kit_token = TOKEN_NS.model(
    "KitToken",
    {
        "ipaddress": fields.String(pattern=IP_ADDRESS_PATTERN),
        "kit_token_id": fields.String(required=False),
    },
    strict=True,
)

kit_token_list = TOKEN_NS.schema_model(
    "KitTokenList", {"type": "array", "items": {
        "$ref": "#/definitions/KitToken"}}
)
