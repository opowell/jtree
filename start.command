#!/bin/sh
# jtree launcher for macOS that opens in Terminal when double-clicked in Finder.
# The first time, macOS may refuse to open a downloaded script: right-click it,
# choose Open, and confirm.
exec "$(dirname "$0")/start.sh" "$@"
