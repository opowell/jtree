#!/bin/sh
# Stops the server listening on a port (3000, $PORT, or the first argument),
# with JAS's script (vendor/jas/scripts/kill-port.sh).
#
#   scripts/kill-port.sh          # port 3000 (or $PORT)
#   scripts/kill-port.sh 3001
exec sh "$(cd "$(dirname "$0")/.." && pwd)/vendor/jas/scripts/kill-port.sh" "$@"
