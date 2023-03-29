from functools import wraps

from flask import request
from marshmallow import ValidationError


def required_params(schema):
    def decorator(fn):

        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                schema.load(request.get_json())
            except ValidationError as validation_error:
                error = {
                    "status": "error",
                    "messages": validation_error.messages
                }
                return error, 400
            return fn(*args, **kwargs)
        return wrapper
    return decorator
