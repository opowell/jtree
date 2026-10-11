#!/bin/bash
# Starts z-Tree afresh in the container, on its virtual display.
docker exec jtree-ztree bash -c 'wineserver -k 2>/dev/null; sleep 2; pgrep Xvfb >/dev/null || (Xvfb :1 -screen 0 1280x900x24 &>/dev/null &); sleep 1'
docker exec -d -w /work jtree-ztree wine 'Z:\ztree\ztree.exe' /dir 'Z:\work\data' /language en
for i in $(seq 1 60); do docker exec jtree-ztree xdotool search --name '^zTree - ' >/dev/null 2>&1 && break; sleep 1; done
sleep 3
