#!/bin/sh
# jtree launcher for macOS and Linux: runs the bundled JAS server (vendor/jas)
# on this repo's apps/ folder, where apps/jtree starts jtree's server under
# /jtree ("route" in apps/jtree/settings.json).
set -e

script=$0
while [ -L "$script" ]; do
  link=$(readlink "$script")
  case $link in
    /*) script=$link ;;
    *) script=$(dirname "$script")/$link ;;
  esac
done
DIR=$(cd "$(dirname "$script")" && pwd)

# An empty submodule directory is the usual way a fresh clone breaks: the
# server then dies on a module-not-found that says nothing about submodules.
if [ ! -f "$DIR/vendor/jas/jas.sh" ]; then
  echo 'jtree: submodules missing, running git submodule update --init --recursive'
  git -C "$DIR" submodule update --init --recursive
fi

# jtree's own server dependencies (express, socket.io, ...) are not committed;
# release archives ship them installed.
if [ ! -d "$DIR/server/node_modules" ]; then
  echo 'jtree: installing server dependencies'
  if command -v pnpm >/dev/null 2>&1; then
    (cd "$DIR/server" && pnpm install --prod)
  else
    (cd "$DIR/server" && npm install --omit=dev)
  fi
fi

export JAS_APPS="$DIR/apps"
export PORT="${PORT:-3000}"
echo "jtree admin: http://localhost:$PORT/jtree/admin"
exec sh "$DIR/vendor/jas/jas.sh" "$@"
