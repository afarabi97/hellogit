from typing import List

from app.models.kubernetes import AssociatedPodModel

ASSOCIATED_POD_1 = {
    "podName": "coredns-977b74bc6-cj4br",
    "namespace": "kube-system"
} # type: AssociatedPodModel
ASSOCIATED_POD_2 = {
    "podName": "coredns-977b74bc6-ctwd5",
    "namespace": "kube-system_2"
} # type: AssociatedPodModel

ASSOCIATED_PODS = [
    ASSOCIATED_POD_1,
    ASSOCIATED_POD_2
] # type: List[AssociatedPodModel]
