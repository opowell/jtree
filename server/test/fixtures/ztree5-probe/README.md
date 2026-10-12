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

`rowinputs.txt` is `probe.txt` with an input in each row of its contract list (Offers: "How
many", 1 to 5, into the row's Qty), which its Take button records (Taken = Qty), as GIMS's
multi-unit orders have them.

`tables.txt` is a treatment for z-Tree's table dumpers and loaders: its first stage's programs set
X = Subject * 10 and, 2 seconds later, Z = 5, and its dumper writes the subjects table to
`dump.txt`; its second stage's loader reads `load.txt` (subjects: X = 99, and W, which the treatment
does not have), then its program sets V = X + 1. In z-Tree 5.1.21, the dump (a line naming the
table and its variables, then one per record, tab-separated) had X = 10 and Z = 0: dumpers run as
the stage starts, after its programs. The loader reported "Error(s) reading table "subjects":
Variable(s) not defined: W", and the subject then had X = 99, V = 100, and every other variable
0 (Z, and Group, Participate, ...): a loader replaces the table's records, before the stage's
programs.

`textmap.txt` names its dumpers' files with z-Tree's text mapping (`<\K|!text:9="nine";10="ten";99="nn";>`)
of values that have no text of their own: in z-Tree 5.1.21, K = 3, 50 and 200 gave tm_k_nine.txt,
tm_l_ten.txt and tm_m_nn.txt, and (the same with K = 90, 9.6, 9.5) "nn", "ten" and "nine": a value
takes the text of the nearest one listed, of two as near the lower.
