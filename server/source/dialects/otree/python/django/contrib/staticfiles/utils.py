"""django.contrib.staticfiles.utils.get_files: the files in a storage, recursively."""
import fnmatch
import os


def get_files(storage, ignore_patterns=None, location=''):
    ignore_patterns = ignore_patterns or []
    directories, files = storage.listdir(location)
    for name in files:
        if not any(fnmatch.fnmatchcase(name, p) for p in ignore_patterns):
            yield os.path.join(location, name) if location else name
    for name in directories:
        if not any(fnmatch.fnmatchcase(name, p) for p in ignore_patterns):
            yield from get_files(storage, ignore_patterns, os.path.join(location, name) if location else name)
