# z-Tree under Wine, scripted

Runs the real z-Tree (and z-Leaf) in a Linux container with Wine and a virtual display, so that
scripts can drive them: open treatments, export them as text, save them in z-Tree's own format,
take screenshots. jtree's z-Tree readers are checked against what z-Tree itself makes this way
(`server/test/ztree.test.js`).

z-Tree is not part of jtree and must not be committed or passed on (its licence, 1.3): put your
copy in a folder `ztree-<version>/` at the repository's root (ignored by git), or point
`ZTREE_DIR` at it.

    tools/ztree-wine/start.sh            # builds the image once, starts the container and z-Tree
    tools/ztree-wine/zt shot NAME        # a screenshot: tools/ztree-wine/out/NAME.png
    tools/ztree-wine/zt click X Y        # also: dclick, key KEYS, type TEXT, windows
    tools/ztree-wine/restart.sh          # z-Tree afresh (after a dialog got stuck, say)

Treatments to work on go in `tools/ztree-wine/work/` (the container's `Z:\work`):

    cd tools/ztree-wine/work
    ../export-all.sh pg.ztt noda.ztt     # File → Export → Treatment: work/export/<name>..txt
    ../resave-all.sh pg.ztt noda.ztt     # File → Save As (z-Tree 5's format): work/saved/<name>
    ../import-save.sh probe.txt          # File → Import, then Save As: work/saved/probe.ztt

The menus are clicked at fixed places of z-Tree's window (1280×900 display); z-Tree runs
emulated (x86 on Apple silicon), so the scripts wait for each dialog and click again if a click
was lost.

To check jtree's readers against z-Tree's exports of its examples, copy them where the tests
look for them (ignored by git: they are made from z-Tree's files):

    mkdir -p server/test/fixtures/ztree-examples/ztree5/export server/test/fixtures/ztree-examples/ztree5/saved
    for f in tools/ztree-wine/work/export/*..txt; do b=$(basename "$f" ..txt); cp "$f" server/test/fixtures/ztree-examples/ztree5/export/$b.txt; done
    cp tools/ztree-wine/work/saved/* server/test/fixtures/ztree-examples/ztree5/saved/
