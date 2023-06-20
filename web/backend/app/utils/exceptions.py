from app.utils.constants import KUBE_CONFIG_LOCATION


class ConfigNotFound(Exception):
    def __init__(self, *args, **kwargs):
        super().__init__(
            "Config file does not exist: {}".format(KUBE_CONFIG_LOCATION),
            *args,
            **kwargs
        )


class NoSuchNodeJobError(Exception):
    pass


class NoDiagnosticLogError(Exception):
    pass


class InternalServerError(Exception):
    pass


class NoSuchLogError(Exception):
    pass


class NoSuchLogArchiveError(Exception):
    pass