# A treatment saved by z-Tree 5

`probe.txt` is a small treatment written for jtree's tests (in z-Tree's text format): tables with
lifetimes, a stage that starts if possible and is an auction, a contract list box (condition,
sorting, owner), buttons that leave and do not, a plot box (a line with arrows, an aligned text,
a graph with a point a subject drags), an input box, roles, and the parameter table's programs.

`probe.ztt` is the same treatment as z-Tree 5.1.21 saves it (file version 46): imported into
z-Tree (File → Import) and saved (File → Save As) with `tools/ztree-wine/import-save.sh`. The
tests read both and expect the same treatment.
