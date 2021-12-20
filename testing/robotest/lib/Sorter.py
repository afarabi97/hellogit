import re


class Sorter:
    ROBOT_LISTENER_API_VERSION = 2
    ROBOT_LIBRARY_SCOPE = "GLOBAL"

    def sort(self, values):
        """Sort the given iterable in the way that humans expect."""
        convert = lambda text: int(text) if text.isdigit() else text
        alphanum_key = lambda key: [convert(c) for c in re.split("([0-9]+)", key)]
        return sorted(values, key=alphanum_key)

    def reverseSort(self, values):
        """Sort the given iterable in the way that humans expect."""
        convert = lambda text: int(text) if text.isdigit() else text
        alphanum_key = lambda key: [convert(c) for c in re.split("([0-9]+)", key)]
        return sorted(values, key=alphanum_key, reverse=True)


    def reorder_catalog_install_list(self, app_list: list) -> list:
        arkime_viewer = "Arkime-viewer"
        remote_health_agent = "Remote-health-agent"

        for index, app in enumerate(app_list):
            lApp = app.lower()
            if lApp == "arkime":
                if arkime_viewer not in app_list[:index]:
                    app_list.insert(index, arkime_viewer)
            if app == remote_health_agent:
                app_list.pop(index)
        return app_list
