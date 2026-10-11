#!/bin/bash
# Builds the image (once) and starts the container: z-Tree's folder (ZTREE_DIR, by default the
# repository's ztree-*/ folder) read-only at /ztree, ./work at /work, ./out (screenshots) at /out.
# Then starts z-Tree on the container's virtual display (restart.sh).
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
ZTREE_DIR=${ZTREE_DIR:-$(ls -d "$HERE"/../../ztree-*/ 2>/dev/null | head -1)}
[ -f "$ZTREE_DIR/ztree.exe" ] || { echo "No ztree.exe in ZTREE_DIR ($ZTREE_DIR)"; exit 1; }
mkdir -p "$HERE/work/data" "$HERE/work/export" "$HERE/work/saved" "$HERE/out"
docker image inspect jtree-ztree-wine >/dev/null 2>&1 || docker build --platform linux/amd64 -t jtree-ztree-wine "$HERE"
docker rm -f jtree-ztree >/dev/null 2>&1 || true
docker run -d --name jtree-ztree --platform linux/amd64 -v "$ZTREE_DIR":/ztree:ro -v "$HERE/work":/work -v "$HERE/out":/out jtree-ztree-wine sleep infinity >/dev/null
docker exec -d jtree-ztree Xvfb :1 -screen 0 1280x900x24
sleep 2
"$HERE/restart.sh"
echo "z-Tree is running. ./zt shot NAME takes a screenshot (out/NAME.png)."
