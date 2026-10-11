#!/bin/bash
# Opens each treatment in /work with z-Tree and saves it again, in z-Tree's own format, as /work/saved/<name>.
Z=$(dirname "$0")/zt
x() { docker exec jtree-ztree xdotool "$@"; }
press() { x mousemove "$1" "$2" sleep 0.4 mousedown 1 sleep 0.2 mouseup 1; }
waitwin() { for i in $(seq 1 20); do docker exec jtree-ztree xdotool search --name "$1" >/dev/null 2>&1 && return 0; sleep 1; done; return 1; }
# menu Y TITLE: File > the item at Y, until a window TITLE opens (clicks get lost while z-Tree is busy).
menu() { for k in 1 2 3 4; do press 20 33; sleep 2; press "$2" "$1"; waitwin "$3" && return 0; $Z key Escape; sleep 2; done; return 1; }
dismiss() { for i in 1 2 3 4 5; do sleep 2; docker exec jtree-ztree xdotool search --name '^Dialog$' >/dev/null 2>&1 || return 0; $Z key Return; done; }
for f in "$@"; do
  menu 87 45 '^Open$' || { echo "$f: no Open dialog"; continue; }
  sleep 1; press 520 548; $Z key End shift+Home BackSpace; $Z type "Z:\\work\\$f"; $Z key Return
  sleep 6; dismiss
  menu 138 50 '^Save As$' || { echo "$f: no Save As dialog"; continue; }
  sleep 1; press 610 548; $Z key End shift+Home BackSpace; $Z type "Z:\\work\\saved\\$f"; $Z key Return
  sleep 5; dismiss
  press 20 33; sleep 1.5; press 40 104; sleep 3
  docker exec jtree-ztree xdotool search --name '^zTree$' >/dev/null 2>&1 && { $Z key n; sleep 3; }
  dismiss
  echo "$f: $(ls -la "$(dirname "$0")/work/saved/$f" 2>/dev/null | awk '{print $5}')"
done
