# A treatment saved by z-Tree 5

`probe.txt` is a small treatment written for jtree's tests (in z-Tree's text format): tables with
lifetimes, a stage that starts if possible and is an auction, a contract list box (condition,
sorting, owner), buttons that leave and do not, a plot box (a line with arrows, an aligned text,
a graph with a point a subject drags), an input box, roles, and the parameter table's programs.

`probe.ztt` is the same treatment as z-Tree 5.1.21 saves it (file version 46): imported into
z-Tree (File → Import) and saved (File → Save As) with `tools/ztree-wine/import-save.sh`. The
tests read both and expect the same treatment.

`rules.txt` is a treatment for where z-Tree's rules differ from jtree's: array indexes out of range
(above, below, between elements, in an array from 2 to 4) and arithmetic that is not a finite
number (1/0, -1/0, 0/0, inf - inf, inf * 0, sqrt(-1)). Run in z-Tree 5.1.21 (one z-Leaf, under
Wine), its globals table was:

    R1 = a[7] = 9    R2 = a[0] = 1    R3 = a[-5] = 1    R4 = a[2.5] = 9    R5 = a[2.4] = 2    R6 = a[1.6] = 2
    c[0] = 4 → c[1] = 4    d[-5] = 6 → d[1] = 6    e[2.5] = 7 → e[3] = 7    f[1] = 8 → f[2] = 8    W1 = f[9] = 0
    D1 = inf    D2 = -inf    D3 to D6 = -nan(ind)    D7 = 2 (programs go on; no error)

That is: an index is rounded to the nearest element, and out of range is the first or last one.
`test/ztree.test.js` expects the same in a session in 'ztree' mode, and errors in 'jtree' mode.
