# z-Tree's example treatments

z-Tree's own examples, from https://www.ztree.uzh.ch/en/examples.html: public goods (pg), ultimatum
(ug), prisoner's dilemma (pd), a 2×2 game (game222), a double auction (noda), an asset market
(asset_da), a Dutch auction, a showcase of boxes and items (ifelems_e), a chat (chatdemo), a questionnaire (brand16.ztq), and the graphics examples
(https://www.ztree.uzh.ch/en/examples/graphics.html: plot boxes).

They are z-Tree's, published without a licence of their own, so they are not in this repository:
`test/ztree.test.js` downloads them here the first time it runs (the files are ignored by git),
and skips its tests on them when it cannot.

Also downloaded here, by `test/ztree-formats.test.js`: GIMS (`gims/`), Stefan Palan's market
treatment (https://github.com/stpalan/GIMS, a fixed version of it, with its licence), which is
published as z-Tree's text export.

`ztree5/` holds what z-Tree 5 makes of the examples, made locally with `tools/ztree-wine`: its
text exports (`export/<name>.txt`) and the examples saved again in its own format (`saved/`). The
tests compare jtree's readers with them when they are there.
