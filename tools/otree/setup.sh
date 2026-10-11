#!/bin/bash
# Installs oTree VERSION (default 5.11.5) in tools/otree/VERSION/venv, to check jtree against:
#   tools/otree/setup.sh 5.11.5     # oTree 5: apps in __init__.py
#   tools/otree/setup.sh 3.4.0      # oTree 3 (Django): apps with models.py and pages.py
# Then tools/otree/VERSION/venv/bin/otree is oTree's command (otree devserver, otree test, ...).
# The installs are ignored by git (see .gitignore); run this again to remake one.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
VERSION=${1:-5.11.5}
case "$VERSION" in
  2.*|3.*) PYTHONS="python3.9 python3.8 python3.7 /usr/bin/python3" ;;  # Django 2.2
  *) PYTHONS="python3.12 python3.11 python3.10 python3" ;;
esac
for p in $PYTHONS; do command -v "$p" >/dev/null 2>&1 && { PY=$p; break; }; done
case "$VERSION" in 2.*|3.*) [ "$PY" = /usr/bin/python3 ] && ! /usr/bin/python3 -c 'import sys; sys.exit(sys.version_info >= (3, 9))' && PY= ;; esac
if [ -z "$PY" ]; then
  # oTree 3 needs Python 3.7 or 3.8: a standalone one, from uv, kept here (tools/otree/python).
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
"$HERE/$VERSION/venv/bin/pip" install -q "otree==$VERSION"
"$HERE/$VERSION/venv/bin/python" -c "import otree; print(\"oTree\", otree.__version__)"
