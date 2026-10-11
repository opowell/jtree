#!/bin/bash
# Installs oTree VERSION (default 5.11.5) in tools/otree/VERSION/venv, to check jtree against:
#   tools/otree/setup.sh 5.11.5     # oTree 5: apps in __init__.py
#   tools/otree/setup.sh 3.4.0      # oTree 3 (Django): apps with models.py and pages.py
#   tools/otree/setup.sh 2.5.8      # oTree 2 (Django): older apps of that format
# Then tools/otree/VERSION/venv/bin/otree is oTree's command (otree devserver, otree test, ...).
# The installs are ignored by git (see .gitignore); run this again to remake one.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
VERSION=${1:-5.11.5}
case "$VERSION" in
  2.*) PYTHONS="python3.8" ;;  # oTree 2.5 asks for Python 3.7 (see below)
  3.*) PYTHONS="python3.8 python3.7" ;;  # Django 2.2; oTree 3: 3.7 or 3.8
  *) PYTHONS="python3.12 python3.11 python3.10 python3" ;;
esac
for p in $PYTHONS; do command -v "$p" >/dev/null 2>&1 && { PY=$p; break; }; done
if [ -z "$PY" ]; then
  # oTree 2 and 3 need an older Python: a standalone one, from uv, kept here (tools/otree/python).
  case "$VERSION" in 2.*|3.*) WANT=3.8 ;; *) WANT=3.12 ;; esac
  if [ ! -x "$HERE/uv/bin/uv" ]; then
    python3 -m venv "$HERE/uv" && "$HERE/uv/bin/pip" install -q uv
  fi
  export UV_PYTHON_INSTALL_DIR="$HERE/python"
  "$HERE/uv/bin/uv" python install "$WANT"
  PY=$("$HERE/uv/bin/uv" python find "$WANT")
fi
echo "oTree $VERSION with $($PY --version) in $HERE/$VERSION/venv"
rm -rf "$HERE/$VERSION/venv"
mkdir -p "$HERE/$VERSION"
"$PY" -m venv "$HERE/$VERSION/venv"
"$HERE/$VERSION/venv/bin/pip" install -q --upgrade pip
# requests: for oTree's bots (otree test).
case "$VERSION" in
  2.*)
    # oTree 2.5's setup.py stops on any Python but 3.7, which uv does not have for macOS; its
    # Django 2.2 runs on 3.8. So: its source, without that check.
    SRC="$HERE/$VERSION/src"
    rm -rf "$SRC" && mkdir -p "$SRC"
    "$HERE/$VERSION/venv/bin/pip" download -q --no-deps --no-binary :all: "otree==$VERSION" -d "$SRC" || true
    if [ ! -f "$SRC/otree-$VERSION.tar.gz" ]; then
      URL=$("$HERE/$VERSION/venv/bin/python" -c "import json, urllib.request; print([u['url'] for u in json.load(urllib.request.urlopen('https://pypi.org/pypi/otree/$VERSION/json'))['urls'] if u['packagetype'] == 'sdist'][0])")
      curl -sL -o "$SRC/otree-$VERSION.tar.gz" "$URL"
    fi
    tar xzf "$SRC/otree-$VERSION.tar.gz" -C "$SRC"
    sed -i.bak 's/^if sys.version_info\[:2\] != (3, 7):/if False:/; s/^if sys.version_info >= (3, 8):/if False:/' "$SRC/otree-$VERSION/setup.py"
    # Its pins of 2019's builds of compiled packages (cffi, cryptography, Twisted, ...) do not
    # build on today's systems: those float; oTree's own (Django, channels, daphne, ...) stay.
    sed -i.bak -E 's/^(cffi|cryptography|zope\.interface|Twisted|msgpack|msgpack-python|asn1crypto|pycparser|attrs|PyHamcrest|autobahn|txaio|Automat|hyperlink|incremental|constantly)==[^ #]*/\1/' "$SRC/otree-$VERSION/requirements.txt"
    "$HERE/$VERSION/venv/bin/pip" install -q "$SRC/otree-$VERSION" requests
    ;;
  *) "$HERE/$VERSION/venv/bin/pip" install -q "otree==$VERSION" requests ;;
esac
"$HERE/$VERSION/venv/bin/python" -c "import otree; print(\"oTree\", otree.__version__)"
