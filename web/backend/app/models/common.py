from app.utils.namespaces import COMMON_NS
from flask_restx import fields

"""
Example of the common Error format.

{
  "upstream_ntp": [
    "Not a valid IPv4 address."
  ]
},

{
  "post_validation": [
    "Kickstart form submission require at least 2 nodes to be defined before submission."
  ]
}
"""
COMMON_ERROR_DTO1 = COMMON_NS.model('CommonFieldError', {
    "<field_name>": fields.List(fields.String(required=False,
                                              example="Not a valid IPv4 address.",
                                              description="<field_name> refers to one of the fields in the marshmallow's model. \
                                               Note: many of these can be defined within the dictionary. Loop over \
                                               all the keys of the dictionary to parse out all the validation logic"))
})

COMMON_ERROR_DTO = COMMON_NS.model('CommonFieldErrorWithPostValidation', {
    "<field_name>": fields.List(fields.String(required=False,
                                              example="Not a valid IPv4 address.",
                                              description="<field_name> refers to one of the fields in the marshmallow's model. \
                                               Note: many of these can be defined within the dictionary. Loop over \
                                               all the keys of the dictionary to parse out all the validation logic")),
    "post_validation": fields.List(fields.String(example="Duplicate hostname found! sensor2.lan cannot have the same hostname as sensor2.lan"),
                                   required=False,
                                   description="Post validation is custom validation after marshmallows valdation logic is executed")
})


COMMON_RETURNS = COMMON_NS.model("Misc", {
    "ip_blocks": fields.List(fields.String(example="10.40.12.16"),
                             example=["10.40.12.32", "10.40.12.64",
                                 "10.40.12.96", "10.40.12.128"],
                             description="IP blocks /27 within a given subnet that are not in use."),
    "ip_addresses": fields.List(fields.String(example="10.40.12.4"),
                                example=["10.40.12.2", "10.40.12.4",
                                         "10.40.12.5", "10.40.12.6", "10.40.12.7"],
                                description="IP addresses within a given subnet that are not in use.")
})


COMMON_MESSAGE = COMMON_NS.model("Message", {
    "message": fields.String(required=False,
                             example="A message sent back from the message that would normally go to a toast popup.")
})


COMMON_ERROR_MESSAGE = COMMON_NS.model("ErrorMessage", {
    "error_message": fields.String(required=False,
                                   example="A message sent back from the message that would normally go to a toast popup.")
})


COMMON_SUCCESS_MESSAGE = COMMON_NS.model("SuccessMessage", {
    "success_message": fields.String(required=False,
                                     example="A message sent back from the message that would normally go to a toast popup.")
})
