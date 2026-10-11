#!/bin/bash
# Opens each treatment in /work with z-Tree and exports it as text to /work/export/<name>.txt.
Z=$(dirname "$0")/zt
x() { docker exec jtree-ztree xdotool "$@"; }
press() { x mousemove "$1" "$2" sleep 0.4 mousedown 1 sleep 0.2 mouseup 1; }
waitwin() { for i in $(seq 1 60); do docker exec jtree-ztree xdotool search --name "$1" >/dev/null 2>&1 && return 0; sleep 1; done; return 1; }
dismiss() { # z-Tree's notices: OK them (keyboard focus is in the notice)
  for i in 1 2 3 4 5; do sleep 2; docker exec jtree-ztree xdotool search --name '^Dialog$' >/dev/null 2>&1 || return 0; $Z key Return; done; }
for f in "$@"; do
  name=$(basename "$f"); base=${name%.*}
  press 20 33; sleep 1.5; press 45 87
  waitwin '^Open$' || { echo "$base: no Open dialog"; continue; }
  sleep 1; press 520 548; $Z key End shift+Home BackSpace; $Z type "Z:\\work\\$name"; $Z key Return
  sleep 6; dismiss
  press 20 33; sleep 1.5; x mousemove 45 164; sleep 1.5; press 240 164
  waitwin '^Save$' || { echo "$base: no Save dialog"; continue; }
  sleep 1; press 610 548; $Z key End shift+Home BackSpace; $Z type "Z:\\work\\export\\$base"; $Z key Return
  sleep 5; dismiss
  # Close the treatment's window (File > Close).
  press 20 33; sleep 1.5; press 40 104; sleep 3
  # "Save changes?" (it was converted to z-Tree 5 on opening): no.
  docker exec jtree-ztree xdotool search --name '^zTree$' >/dev/null 2>&1 && { $Z key n; sleep 3; }
  dismiss
  ls /dev/null >/dev/null
  echo "$base: $(ls "$(dirname "$0")/work/export/" | grep -c "^$base")"
done
