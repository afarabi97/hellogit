import glob
import os
from functools import wraps

import jwt
import yaml
from app.common import FORBIDDEN_RESPONSE
from app.persistence import DBModelNotFound
from app.models import PostValidationError
from app.utils.constants import (CONTROLLER_ADMIN_ROLE,
                                 CONTROLLER_MAINTAINER_ROLE,
                                 DEFAULT_REQUIRED_ROLES, OPERATOR_ROLE,
                                 REALM_ADMIN_ROLE, WEB_DIR)
from app.utils.exceptions import (FailedToUploadFile, FailedToUploadWinLog,
                                  InternalServerError, NoSuchLogArchiveError,
                                  NoSuchLogError, NoSuchNodeJobError,
                                  NotFoundError, ObjectKeyError,
                                  ResponseConflictError)
from app.utils.logging import logger
from rq.exceptions import NoSuchJobError
from werkzeug.wrappers import Request, Response

JWT_DIR = "/opt/sso-idp/jwt/"
MIME_TYPE = "text/plain"


def get_public_keys():
    keys = {"keys": []}
    public_keys = glob.glob(JWT_DIR + "*.pub")
    if len(public_keys) != 0:
        for pub in public_keys:
            f = open(pub, "r")
            key = {
                "e": "AQAB",
                "kty": "RSA",
                "alg": "RS256",
                "use": "sig",
                "kid": os.path.basename(pub).replace(".pub", ""),
                "n": f.read().strip(),
            }
            f.close()
            keys["keys"].append(key)
    return keys


def get_public_key_from_kid(kid):
    public_keys = get_public_keys()
    key = None
    if len(public_keys) != 0:
        for pub in public_keys["keys"]:
            if pub["kid"] == kid:
                key = pub
                break
    return key


class KeyNotFound(Exception):
    pass


class AuthMiddleware:
    """
    Simple WSGI middleware
    """

    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        request = Request(environ)
        # Bypasses authentication and authorization on webhook API call as Hive does not support modification of Headers.
        # Must be exact match to prevent URL fudging to other API calls.
        if request.url_root + "api/hive/webhook" == request.url:
            return self.app(environ, start_response)

        def get_authorization_type(request):
            authorization = request.headers.get("Authorization", None)
            if authorization:
                try:
                    authorization_type, authorization_credentials = authorization.split(
                        " "
                    )
                    return authorization_type
                except ValueError:
                    return None
            else:
                return None

        def get_token(request):
            return request.headers["Authorization"].split(" ")[1]

        def get_kid_from_token(token):
            header = jwt.get_unverified_header(token)
            return header.get("kid", None)

        def get_public_key(token):
            kid = get_kid_from_token(token)
            if kid:
                public_key = get_public_key_from_kid(kid)
                if public_key:
                    return public_key["n"]
                else:
                    raise KeyNotFound("No public key to validate API key.")
            else:
                return None

        def create_user_data_from_bearer(request):
            token = get_token(request)
            public_key = get_public_key(token)
            user = jwt.decode(token, public_key, algorithms="RS256")
            user["using_api_key"] = True
            return user

        def create_user_data(request):
            user = {}
            attributes = {
                "uid": "single",
                "givenName": "single",
                "surname": "single",
                "displayName": "single",
                "email": "single",
                "roles": "multi",
                "memberOf": "multi",
                "clientRoles": "multi",
            }
            for attr in attributes:
                if attr in request.headers:
                    if attributes[attr] == "single":
                        user[attr] = request.headers[attr]
                    elif attributes[attr] == "multi":
                        user[attr] = request.headers[attr].split(";")
            return user

        try:
            if os.environ["IS_DEBUG_SERVER"] == "yes":
                DEBUG_FILE = str(WEB_DIR / "angular_debug.yml")
                if os.path.isfile(DEBUG_FILE):
                    with open(DEBUG_FILE, "r") as stream:
                        try:
                            user = yaml.safe_load(stream)
                        except yaml.YAMLError as exc:
                            print(exc)
            else:
                raise KeyError()
        except KeyError:
            if get_authorization_type(request) == "Bearer":
                try:
                    user = create_user_data_from_bearer(request)
                except jwt.ExpiredSignatureError:
                    res = Response(
                        "Authorization failed. API key is expired.",
                        mimetype=MIME_TYPE,
                        status=401,
                    )
                    return res(environ, start_response)
                except KeyNotFound:
                    res = Response(
                        "Authorization failed. No public key to validate API key",
                        mimetype=MIME_TYPE,
                        status=401,
                    )
                    return res(environ, start_response)
                except Exception:
                    res = Response(
                        "Authorization failed. See logs", mimetype=MIME_TYPE, status=401
                    )
                    return res(environ, start_response)
            else:
                user = create_user_data(request)

        if "uid" in user and user["uid"] != "":
            environ["user"] = user
            Auth.set_current_user(user)
            return self.app(environ, start_response)

        res = Response("Authorization failed",
                       mimetype="text/plain", status=401)
        return res(environ, start_response)


class Auth:
    user = None
    roles = None
    currentuser = None
    controller_admin = False
    controller_maintainer = False
    operator = False
    realm_admin = False
    api_token = None

    @staticmethod
    def set_current_user(user):
        Auth.user = user
        Auth.roles = user["roles"]
        Auth.currentuser = user["uid"]
        Auth.is_controller_admin()
        Auth.is_controller_maintainer()
        Auth.is_operator()
        Auth.is_realm_admin()
        return True

    @staticmethod
    def get_user():
        return Auth.user

    @staticmethod
    def is_controller_admin():
        if Auth.user != None and CONTROLLER_ADMIN_ROLE in Auth.roles:
            Auth.controller_admin = True
            return True
        return False

    @staticmethod
    def is_controller_maintainer():
        if Auth.user != None and CONTROLLER_MAINTAINER_ROLE in Auth.roles:
            return True
        return False

    @staticmethod
    def is_realm_admin():
        if Auth.user != None and REALM_ADMIN_ROLE in Auth.roles:
            return True
        return False

    @staticmethod
    def is_operator():
        if Auth.user != None and OPERATOR_ROLE in Auth.roles:
            return True
        return False

    @staticmethod
    def get_role(role):
        if Auth.user != None:
            if role in Auth.roles:
                return True
        elif Auth.api_token != None:
            return True
        return False


def controller_admin_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if not Auth.is_controller_admin():
            return FORBIDDEN_RESPONSE
        return f(*args, **kwargs)

    return wrap


def controller_maintainer_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if not Auth.is_controller_maintainer():
            return FORBIDDEN_RESPONSE
        return f(*args, **kwargs)

    return wrap


def operator_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if not Auth.is_operator():
            return FORBIDDEN_RESPONSE
        return f(*args, **kwargs)

    return wrap


def handle_errors(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except PostValidationError as post_validation_error:
            logger.exception(post_validation_error)
            return {"post_validation": post_validation_error.errors_msgs}, 400
        except DBModelNotFound:
            logger.exception("Requested database object not found.")
            return {"error_message": "Requested database object not found."}, 400
        except NoSuchJobError:
            logger.exception("ErrorMessage: Job does not exist")
            return {"error_message": "Job does not exist."}, 404
        except NoSuchNodeJobError:
            logger.exception("ErrorMessage: Node job does not exist")
            return {"error_message": "Node job does not exist."}, 404
        except NoSuchLogError as exception:
            logger.exception(exception)
            return {"error_message": str(exception)}, 404
        except NoSuchLogArchiveError as exception:
            logger.exception(exception)
            return {"error_message": str(exception)}, 404
        except NotFoundError:
            logger.exception("ErrorMessage: Data Object Not Found")
            return {"error_message": "Data Object Not Found"}, 404
        except FileNotFoundError as exception:
            logger.exception(exception)
            return {"error_message": "File Not Found"}, 404
        except ObjectKeyError:
            logger.exception("ErrorMessage: Object Uses Incorrect Key")
            return {"error_message": "Object Keys Error"}, 406
        except FailedToUploadFile:
            logger.exception("Failed to upload file.")
            return {"error_message": "Failed to upload file. No file was found in the request."}, 409
        except ResponseConflictError:
            logger.exception("ErrorMessage: Response Conflict")
            return {"error_message": "Response Conflict"}, 409
        except FailedToUploadWinLog:
            logger.exception("Failed to upload windows log.")
            return {"error_message": "Failed to upload Windows file because Winlogbeat has not been setup for cold log ingest."}, 500
        except InternalServerError:
            logger.exception("ErrorMessage: Internal Server Error")
            return {"error_message": "Internal Server Error."}, 500
        except Exception as exception:
            logger.exception(exception)
            return {"error_message": str(exception)}, 500
    return wrapper


# @login_required_roles(['operator','asdf'], all_roles_req=True)

def login_required_roles(roles=DEFAULT_REQUIRED_ROLES, all_roles_req=False):
    def inner(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if (all_roles_req and not all(elem in Auth.roles for elem in roles)) or (
                not all_roles_req and not any(
                    elem in Auth.roles for elem in roles)
            ):
                return FORBIDDEN_RESPONSE
            return f(*args, **kwargs)

        return wrapper

    return inner
