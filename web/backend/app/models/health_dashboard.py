from app.models import Model
from app.utils.namespaces import APP_NS, HEALTH_NS
from flask_restx import fields


class HealthDashboardModel(Model) :
    DTO = HEALTH_NS.model('HealthDashboard',{
        'elasticsearch_status': fields.String(),
        'kibana_status': fields.String(),
    })


class KibanaLoginInfoModel(Model):
    DTO = APP_NS.model('KibanaLoginInfo',{
        'dns': fields.String(),
        'ip_address': fields.String(),
        'username_password': fields.String()
    })
