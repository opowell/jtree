/*
 * z-Tree's plot boxes on participants' pages: their shapes (in the plot's coordinates, as
 * {range, shapes, inputs, boxInputs} in a .ztree-plot's data-plot) drawn as SVG at the box's
 * size, and their inputs (a click in the plot, a click or a drag on an item): sent by
 * jtZtreePlot.send(div, input, {x, y, x0, y0, x1, y1}), which the page's script sets
 * (ztree.js for z-Tree treatments, ztree-app.js for apps converted from them).
 */
(function () {
    if (window.jtZtreePlot) return;
    var api = window.jtZtreePlot = { draw: null, send: null };

    // --- Plot boxes: their shapes (in the plot's coordinates) drawn as SVG at the box's size. ---

    var SVG = 'http://www.w3.org/2000/svg';
    function el(name, attrs, parent) {
        var e = document.createElementNS(SVG, name);
        for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
        if (parent) parent.appendChild(e);
        return e;
    }

    /** The plot's mapping: plot coordinates to pixels, and back; one scale for both if it keeps proportions. */
    function mapping(range, w, h) {
        var mx = w * 0.06, my = h * 0.06;
        var iw = w - 2 * mx, ih = h - 2 * my;
        var dx = range.x2 - range.x1 || 1, dy = range.y2 - range.y1 || 1;
        var sx = iw / dx, sy = ih / dy;
        if (range.keepAspect) {
            var s = Math.min(Math.abs(sx), Math.abs(sy));
            sx = s * Math.sign(sx); sy = s * Math.sign(sy);
            mx = (w - Math.abs(dx * sx)) / 2; my = (h - Math.abs(dy * sy)) / 2;
        }
        return {
            X: function (x) { return mx + (x - range.x1) * sx; },
            Y: function (y) { return my + (range.y2 - y) * sy; },
            back: function (px, py) { return [range.x1 + (px - mx) / sx, range.y2 - (py - my) / sy]; },
            sx: Math.abs(sx), sy: Math.abs(sy),
        };
    }

    function drawShape(svg, s, m, index) {
        var g = el('g', { 'data-shape': index, 'class': s.inputs && s.inputs.length ? 'ztree-plot-active' : null }, svg);
        var stroke = function (o) { o.stroke = s.color || 'none'; o['stroke-width'] = s.width; return o; };
        if (s.kind === 'point') {
            // size: the radius, in pixels; the corners from the rotation's angle round.
            var cx = m.X(s.x), cy = m.Y(s.y), r = s.size, n = Math.max(2, Math.round(s.corners)), pts = [];
            for (var k = 0; k < n; k++) {
                var a = (s.rotation + 360 * k / n) * Math.PI / 180;
                pts.push([cx + r * Math.cos(a), cy - r * Math.sin(a)]);
            }
            if (s.spokes) {
                pts.forEach(function (p) { el('line', stroke({ x1: cx, y1: cy, x2: p[0], y2: p[1] }), g); });
            } else {
                el('polygon', stroke({ points: pts.map(function (p) { return p.join(','); }).join(' '), fill: s.fill || 'none' }), g);
            }
        } else if (s.kind === 'line' || s.kind === 'polyline') {
            if (s.kind === 'polyline') {
                el('polyline', { points: s.points.map(function (p) { return m.X(p[0]) + ',' + m.Y(p[1]); }).join(' '), stroke: s.color, 'stroke-width': s.width, fill: 'none' }, g);
                return;
            }
            var x1 = m.X(s.x1), y1 = m.Y(s.y1), x2 = m.X(s.x2), y2 = m.Y(s.y2);
            el('line', stroke({ x1: x1, y1: y1, x2: x2, y2: y2, 'stroke-linecap': 'round' }), g);
            var len = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / len, uy = (y2 - y1) / len;
            // An arrowhead of length L at an end (pointing back if its width is negative; L 0: a bar).
            var head = function (tx, ty, dir, L) {
                var W = s.arrowWidth / 2 || L / 2, back = W < 0 ? -1 : 1;
                W = Math.abs(W);
                var bx = tx - dir * ux * L, by = ty - dir * uy * L;
                var tip = back < 0 ? [bx, by] : [tx, ty], base = back < 0 ? [tx, ty] : [bx, by];
                var wing1 = [base[0] - uy * W, base[1] + ux * W], wing2 = [base[0] + uy * W, base[1] - ux * W];
                var pts2 = [wing1, tip, wing2].map(function (p) { return p.join(','); }).join(' ');
                el(s.arrowFilled ? 'polygon' : 'polyline', { points: pts2, stroke: s.color, 'stroke-width': s.width, fill: s.arrowFilled ? s.color : 'none' }, g);
            };
            if (s.arrowEnd) head(x2, y2, 1, s.arrowEnd);
            if (s.arrowStart) head(x1, y1, -1, s.arrowStart);
            else if (s.arrowWidth && s.arrowStart === 0) {
                var W2 = Math.abs(s.arrowWidth) / 2;
                el('line', stroke({ x1: x1 - uy * W2, y1: y1 + ux * W2, x2: x1 + uy * W2, y2: y1 - ux * W2 }), g);
            }
        } else if (s.kind === 'rect') {
            var rx1 = m.X(Math.min(s.x1, s.x2)), rx2 = m.X(Math.max(s.x1, s.x2)), ry1 = m.Y(s.y1), ry2 = m.Y(s.y2);
            el('rect', stroke({ x: Math.min(rx1, rx2), y: Math.min(ry1, ry2), width: Math.abs(rx2 - rx1), height: Math.abs(ry2 - ry1), fill: s.fill || 'none' }), g);
        } else if (s.kind === 'pie') {
            var pcx = m.X(s.x), pcy = m.Y(s.y), prx = Math.abs(s.rx * m.sx), pry = Math.abs(s.ry * m.sy);
            if (Math.abs(s.a2) >= 360) {
                el('ellipse', stroke({ cx: pcx, cy: pcy, rx: prx, ry: pry, fill: s.fill || 'none' }), g);
            } else {
                // From angle a1, a2 degrees round (counter-clockwise, 0 to the right).
                var a1 = s.a1 * Math.PI / 180, a2 = (s.a1 + s.a2) * Math.PI / 180;
                var p1 = [pcx + prx * Math.cos(a1), pcy - pry * Math.sin(a1)], p2 = [pcx + prx * Math.cos(a2), pcy - pry * Math.sin(a2)];
                var large = Math.abs(s.a2) > 180 ? 1 : 0, sweep = s.a2 > 0 ? 0 : 1;
                el('path', stroke({ d: 'M' + pcx + ',' + pcy + ' L' + p1.join(',') + ' A' + prx + ',' + pry + ' 0 ' + large + ',' + sweep + ' ' + p2.join(',') + ' Z', fill: s.fill || 'none' }), g);
            }
        } else if (s.kind === 'text') {
            var anchor = s.hAlign === 0 ? 'start' : s.hAlign === 1 ? 'end' : 'middle';
            var t = el('text', { x: m.X(s.x), y: m.Y(s.y), fill: s.color, 'font-size': s.size, 'text-anchor': anchor, 'dominant-baseline': 'middle' }, g);
            t.textContent = s.text;
        } else if (s.kind === 'axis') {
            var a = function (v) { return s.horizontal ? [m.X(v), m.Y(s.position)] : [m.X(s.position), m.Y(v)]; };
            var from = a(s.from), to = a(s.to);
            el('line', { x1: from[0], y1: from[1], x2: to[0], y2: to[1], stroke: s.color, 'stroke-width': s.width }, g);
            for (var v = Math.ceil(s.from / s.tick - 1e-9) * s.tick; s.tick > 0 && v <= s.to + 1e-9; v += s.tick) {
                var q = a(v);
                el('line', s.horizontal ? { x1: q[0], y1: q[1], x2: q[0], y2: q[1] + 4, stroke: s.color } : { x1: q[0], y1: q[1], x2: q[0] - 4, y2: q[1], stroke: s.color }, g);
            }
            (s.labels || []).forEach(function (l) {
                var q2 = a(l[0]);
                var lt = el('text', s.horizontal ? { x: q2[0], y: q2[1] + 16, 'text-anchor': 'middle', 'font-size': 11 } : { x: q2[0] - 7, y: q2[1] + 4, 'text-anchor': 'end', 'font-size': 11 }, g);
                lt.textContent = l[1];
            });
            if (s.caption) {
                var mid = a((s.from + s.to) / 2);
                var ct = el('text', s.horizontal ? { x: mid[0], y: mid[1] + 34, 'text-anchor': 'middle', 'font-size': 12 } : { x: mid[0] - 40, y: mid[1], 'text-anchor': 'middle', 'font-size': 12 }, g);
                ct.textContent = s.caption;
            }
        }
    }

    /** Draws root's plots; if onlyNew, only those not drawn yet at their size (hidden, say, when their screen came). */
    function drawPlots(root, onlyNew) {
        var plots = (root || document).querySelectorAll('.ztree-plot[data-plot]');
        for (var i = 0; i < plots.length; i++) {
            var div = plots[i];
            var w = div.clientWidth, h = div.clientHeight;
            if (!w || !h) continue;
            var src = div.getAttribute('data-plot');
            if (onlyNew && div._plot && div._plot.w === w && div._plot.h === h && div._plot.src === src && div.firstChild) continue;
            var data;
            try { data = JSON.parse(src); } catch (e) { continue; }
            if (data == null || data.range == null) continue;
            var m = mapping(data.range, w, h);
            div.innerHTML = '';
            var svg = el('svg', { width: w, height: h, 'class': 'ztree-plot-svg', overflow: 'visible' }, div);
            data.shapes.forEach(function (s, k) { drawShape(svg, s, m, k); });
            div._plot = { data: data, map: m, w: w, h: h, src: src };
        }
    }

    // A plot's inputs: a drag on an item that takes drags, a click on one that takes clicks, else
    // a click in the plot.
    var dragging = null;
    function plotPoint(div, event) {
        var rect = div.getBoundingClientRect();
        return div._plot.map.back(event.clientX - rect.left, event.clientY - rect.top);
    }
    document.addEventListener('mousedown', function (e) {
        var div = e.target.closest && e.target.closest('.ztree-plot');
        if (!div || !div._plot) return;
        var shapeEl = e.target.closest('[data-shape]');
        dragging = { div: div, start: plotPoint(div, e), px: [e.clientX, e.clientY], shape: shapeEl ? div._plot.data.shapes[Number(shapeEl.getAttribute('data-shape'))] : null };
        e.preventDefault();
    });
    document.addEventListener('mouseup', function (e) {
        if (!dragging) return;
        var d = dragging;
        dragging = null;
        var data = d.div._plot.data;
        var end = plotPoint(d.div, e);
        var moved = Math.hypot(e.clientX - d.px[0], e.clientY - d.px[1]) > 4;
        var byId = {};
        data.inputs.forEach(function (inp) { byId[inp.id] = inp; });
        var want = moved ? 2 : 1;
        var input = d.shape ? (d.shape.inputs || []).map(function (id) { return byId[id]; }).filter(function (inp) { return inp && inp.action === want; })[0] : null;
        if (input == null && !moved) {
            input = (data.boxInputs || []).map(function (id) { return byId[id]; }).filter(function (inp) { return inp && inp.action === 0; })[0];
        }
        if (input == null) return;
        if (api.send) api.send(d.div, input, { x: end[0], y: end[1], x0: d.start[0], y0: d.start[1], x1: end[0], y1: end[1] });
    });
    window.addEventListener('resize', function () { drawPlots(); });
    // Plots not drawn yet, or whose size or data changed (a screen shown, an update), drawn.
    setInterval(function () { drawPlots(document, true); }, 250);

    api.draw = drawPlots;
})();
