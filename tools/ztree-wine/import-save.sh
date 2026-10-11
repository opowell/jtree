#!/bin/bash
# Imports each text treatment in /work with z-Tree and saves it as /work/saved/<name>.ztt.
Z=$(dirname "$0")/zt
x() { docker exec jtree-ztree xdotool "$@"; }
press() { x mousemove "$1" "$2" sleep 0.4 mousedown 1 sleep 0.2 mouseup 1; }
newwin() { for i in $(seq 1 60); do w=$(docker exec jtree-ztree bash -c 'for w in $(xdotool search --name "."); do echo "$(xdotool getwindowname $w)"; done' | grep -v -E "IME|Socket|^zTree" | head -1); [ -n "$w" ] && { echo "$w"; return 0; }; sleep 1; done; return 1; }
dismiss() { for i in 1 2 3 4 5; do sleep 2; docker exec jtree-ztree xdotool search --name '^Dialog$' >/dev/null 2>&1 || return 0; "$Z" shot "dialog-$i"; $Z key Return; done; }
for f in "$@"; do
  base=${f%.*}
  press 20 33; sleep 1.5; press 45 181
  echo "import dialog: $(newwin)"
  sleep 1; press 520 548; $Z key End shift+Home BackSpace; $Z type "Z:\\work\\$f"; $Z key Return
  sleep 8; dismiss
  $Z shot "imported-$base"
  press 20 33; sleep 1.5; press 50 138
  echo "save dialog: $(newwin)"
  sleep 1; press 610 548; $Z key End shift+Home BackSpace; $Z type "Z:\\work\\saved\\$base.ztt"; $Z key Return
  sleep 5; dismiss
  press 20 33; sleep 1.5; press 40 104; sleep 3
  docker exec jtree-ztree xdotool search --name '^zTree$' >/dev/null 2>&1 && { $Z key n; sleep 3; }
  dismiss
  ls -la "$(dirname "$0")/work/saved/" | grep "$base"
done
