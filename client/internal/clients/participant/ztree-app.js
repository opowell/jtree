/*
 * The pages of jtree apps converted from z-Tree treatments (server/source/dialects/ztree/convert.js),
 * on their interactive stages: a button sends its box's inputs ('ztButton': with the inputs of the
 * screen's boxes without buttons, and the row chosen in a list), Enter in a chat box sends the entry
 * ('ztChat'), a plot box's input is sent ('ztPlot'; its drawing is ztree-plot.js's), and the
 * server's messages ('ztMessage') are shown as z-Leaf shows them.
 */
(function () {
    if (window.jtZtreeApp) return;
    window.jtZtreeApp = true;

    /**
     * The values of the inputs in el, by name (a checkbox not ticked: none); of a list's rows,
     * only the chosen row's (row: its radio).
     */
    function values(el, row) {
        var out = {};
        var inputs = el.querySelectorAll('input[name], select[name], textarea[name]');
        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            if (/^zt-row-/.test(input.name)) continue;
            var tr = input.closest('tr');
            if (tr && tr.querySelector('input[name^="zt-row-"]') && (row == null || !tr.contains(row))) continue;
            if ((input.type === 'radio' || input.type === 'checkbox') && !input.checked) continue;
            out[input.name] = input.value;
        }
        return out;
    }

    function send(name, data) {
        if (window.jt && jt.sendMessage) jt.sendMessage(name, data);
    }

    document.addEventListener('click', function (e) {
        // A click in a list's row (in its input, say) chooses it.
        var tr = e.target.closest && e.target.closest('tr');
        var radio = tr && tr.querySelector('input[name^="zt-row-"]');
        if (radio) radio.checked = true;
        var button = e.target.closest && e.target.closest('.zt-button');
        if (button == null) return;
        var box = button.closest('[data-zt-box]');
        var screen = button.closest('[data-zt-stage]');
        if (box == null || screen == null) return;
        var others = {};
        var loose = screen.querySelectorAll('[data-zt-loose]');
        for (var i = 0; i < loose.length; i++) others[loose[i].getAttribute('data-zt-box')] = values(loose[i]);
        var row = box.querySelector('input[name^="zt-row-"]:checked');
        send('ztButton', {
            stage: screen.getAttribute('data-zt-stage'),
            box: box.getAttribute('data-zt-box'),
            button: Number(button.getAttribute('data-zt-button')),
            values: values(box, row),
            others: others,
            record: row ? row.value : null,
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' || !e.target.matches || !e.target.matches('.zt-chat-input')) return;
        e.preventDefault();
        var box = e.target.closest('[data-zt-box]');
        var screen = e.target.closest('[data-zt-stage]');
        if (box == null || screen == null || e.target.value.trim() === '') return;
        send('ztChat', { stage: screen.getAttribute('data-zt-stage'), box: box.getAttribute('data-zt-box'), text: e.target.value });
        e.target.value = '';
    });

    /** A message, in a box with OK (as z-Leaf shows a checker's message). */
    function message(text) {
        var old = document.querySelector('.zt-message');
        if (old) old.remove();
        var div = document.createElement('div');
        div.className = 'zt-message';
        div.innerHTML = '<div class="zt-message-box"><div class="zt-message-text"></div><button type="button" class="zt-message-ok">OK</button></div>';
        div.querySelector('.zt-message-text').textContent = text;
        div.querySelector('.zt-message-ok').addEventListener('click', function () { div.remove(); });
        document.body.appendChild(div);
        div.querySelector('.zt-message-ok').focus();
    }

    var wait = setInterval(function () {
        if (window.jt == null || jt.socket == null) return;
        clearInterval(wait);
        if (window.jtZtreePlot) {
            jtZtreePlot.send = function (div, input, at) {
                var screen = div.closest('[data-zt-stage]');
                if (screen == null) return;
                send('ztPlot', Object.assign({ stage: screen.getAttribute('data-zt-stage'), box: div.getAttribute('data-box'), input: input.id }, at));
            };
        }
        jt.socket.on('ztMessage', function (d) { message(d.text); });
        // Accepted: the box's typed values are cleared (an offer made is not made twice).
        jt.socket.on('ztAccepted', function (d) {
            var box = document.querySelector('[data-zt-box="' + d.box + '"]');
            if (box == null) return;
            var inputs = box.querySelectorAll('input[type=text]');
            for (var i = 0; i < inputs.length; i++) inputs[i].value = '';
        });
    }, 50);
})();
