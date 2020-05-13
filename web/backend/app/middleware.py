from werkzeug.wrappers import Request, Response, ResponseStream
from functools import wraps
from app.common import ERROR_RESPONSE, OK_RESPONSE, FORBIDDEN_RESPONSE
from shared.constants import OPERATOR_ROLE, CONTROLLER_ADMIN_ROLE, REALM_ADMIN_ROLE, CONTROLLER_MAINTAINER_ROLE
import jwt, os, glob, yaml

JWT_DIR = "/opt/sso-idp/jwt/"
MIME_TYPE = 'application/json'

def get_public_keys():
    keys = {
        'keys' : []
    }
    public_keys = glob.glob(JWT_DIR+"*.pub")
    if len(public_keys) != 0:
        for pub in public_keys:
            f = open(pub,"r")
            key = {
                "e": "AQAB",
                "kty": "RSA",
                "alg": "RS256",
                "use": "sig",
                "kid": os.path.basename(pub).replace('.pub',''),
                "n": f.read().strip()
            }
            f.close()
            keys['keys'].append(key)
    return keys

def get_public_key_from_kid(kid):
    public_keys = get_public_keys()
    key = None
    if len(public_keys) != 0:
        for pub in public_keys['keys']:
            if pub['kid'] == kid:
                key = pub
                break
    return key

class auth_middleware():
    '''
    Simple WSGI middleware
    '''

    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        request = Request(environ)
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
        if 'Authorization' in request.headers:
            auth = request.headers['Authorization'].split(' ')
            if auth[0] == "Bearer":
                try:
                    token = auth[1]
                    header = jwt.get_unverified_header(token)
                except IndexError:
                    res = Response('Authorization failed. See logs', mimetype=MIME_TYPE, status=401)
                    return res(environ, start_response)
                if "kid" in header:
                    kid = header['kid']
                    pub_key = get_public_key_from_kid(kid)
                    if not pub_key:
                        res = Response('Authorization failed. No public key to validate API key', mimetype=MIME_TYPE, status=401)
                        return res(environ, start_response)
                    public_key = pub_key['n']
                    try:
                        user = jwt.decode(token, public_key, algorithms='RS256')
                        user['using_api_key'] = True
                    except jwt.ExpiredSignatureError:
                        # Signature has expired
                        #logger.exception(e)
                        res = Response('Authorization failed. API key is expired.', mimetype=MIME_TYPE, status=401)
                        return res(environ, start_response)
                    except Exception:
                        # Signature has expired
                        #logger.exception(e)
                        res = Response('Authorization failed. See logs', mimetype=MIME_TYPE, status=401)
                        return res(environ, start_response)
        else:
            for attr in attributes:
                if attr in request.headers:
                    if attributes[attr] == "single":
                        user[attr] = request.headers[attr]
                    elif attributes[attr] == "multi":
                        user[attr] = request.headers[attr].split(";")
        if "uid" in user and user["uid"] != "":
            environ['user'] = user
            Auth.set_current_user(user)
            return self.app(environ, start_response)

        res = Response('Authorization failed', mimetype= 'text/plain', status=401)
        return res(environ, start_response)

class Auth():
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

# def login_required(f):
#     @wraps(f)
#     def wrap(*args, **kwargs):
#         user = Auth.get_user()
#         # if user is not logged in, redirect to login page
#         if "uid" not in user or user["uid"] == "":
#             return FORBIDDEN_RESPONSE
#         return f(*args, **kwargs)
#     return wrap

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

# @login_required_roles(['operator','asdf'], all_roles_req=True)
def login_required_roles(roles, all_roles_req=False):
    def inner(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if (all_roles_req and not all(elem in Auth.roles for elem in roles)) or (not all_roles_req and not any(elem in Auth.roles for elem in roles)):
                return FORBIDDEN_RESPONSE
            return f(*args, **kwargs)
        return wrapper
    return inner
