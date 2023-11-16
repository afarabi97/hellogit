from app.models.health_dashboard import (HealthDashboardModel,
                                         KibanaLoginInfoModel)

mock_healthdashboard_status: HealthDashboardModel = {
    "elasticsearch_status": "green",
    "kibana_status": "green"
}


mock_hostname = "controller.lan"


mock_kibanainfo: KibanaLoginInfoModel = {
    "dns": "https://kibana.lan",
    "ip_address": "https://10.40.20.99",
    "username_password": "elastic/0oF8E8SnY0Jjp415Iz7WxH01"
}
