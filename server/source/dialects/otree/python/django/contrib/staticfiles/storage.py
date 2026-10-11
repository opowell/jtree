"""django.contrib.staticfiles.storage, as far as oTree apps use it: a folder of static files."""
import os


class StaticFilesStorage:
    def __init__(self, location=None, base_url=None):
        self.location = location or '_static'
        self.base_url = base_url or '/static/'

    def path(self, name):
        return os.path.join(self.location, name)

    def exists(self, name):
        return os.path.exists(self.path(name))

    def listdir(self, path):
        full = self.path(path)
        names = sorted(os.listdir(full)) if os.path.isdir(full) else []
        return ([n for n in names if os.path.isdir(os.path.join(full, n))],
                [n for n in names if os.path.isfile(os.path.join(full, n))])

    def url(self, name):
        return self.base_url + name


staticfiles_storage = StaticFilesStorage()
