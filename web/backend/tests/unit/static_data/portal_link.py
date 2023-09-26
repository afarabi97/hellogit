from typing import List

from app.models.portal_link import PortalLinkModel
from app.models.portal_link_user import UserPortalLinkModel

mock_portal_link_list: List[PortalLinkModel] = [
    {
        "dns": "https://x.x.x.x",
        "ip": "https://url.lan",
        "logins": "name/123abc456def"
    }
]


mock_portal_user_links: List[UserPortalLinkModel] = [
    {
        "name": "Test",
        "url": "https://test.com",
        "description": "This is a test.",
        "_id": "649f12e1893726089b3d69c9"
    }
]
