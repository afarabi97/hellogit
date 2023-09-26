from typing import List

from app.models.kubernetes import AssociatedPodModel

ASSOCIATED_POD_1: AssociatedPodModel = {
    "podName": "coredns-977b74bc6-cj4br",
    "namespace": "kube-system"
}
ASSOCIATED_POD_2: AssociatedPodModel = {
    "podName": "coredns-977b74bc6-ctwd5",
    "namespace": "kube-system_2"
}

ASSOCIATED_PODS: List[AssociatedPodModel] = [
    ASSOCIATED_POD_1,
    ASSOCIATED_POD_2
]
