/*
 * z-Tree treatments' screens on participants' pages (see server/source/dialects/ztree): the server
 * draws them (player.ztreeHtml, and 'ztreeScreen' when they change); this sends buttons, chosen
 * rows and chat entries ('ztreeButton', 'ztreeSelect', 'ztreeChat'), shows the server's messages
 * ('ztreeMessage') as z-Leaf does, counts down the header box's time, and keeps what the subject
 * has typed when a screen is drawn again.
 */
(function () {
    if (window.jtZtree) return;
    window.jtZtree = true;

    // What the subject has typed, by box and input name, until the box's button is accepted.
    var typed = {};

    function visibleScreen() {
        var pages = document.querySelectorAll('.ztree-page');
        for (var i = 0; i < pages.length; i++) {
            if (pages[i].offsetParent !== null || pages[i].getClientRects().length > 0) return pages[i];
        }
        return pages[0] || null;
    }

    function boxOf(el) {
        var box = el.closest('.ztree-box[data-box]');
        return box ? box.getAttribute('data-box') : '';
    }

    function remember(input) {
        var box = boxOf(input);
        typed[box] = typed[box] || {};
        if (input.type === 'radio') {
            if (input.checked) typed[box][input.name] = input.value;
        } else if (input.type === 'checkbox') {
            typed[box][input.name] = input.checked ? input.value : '';
        } else {
            typed[box][input.name] = input.value;
        }
    }

    function restore(root) {
        var inputs = root.querySelectorAll('.ztree-input input, .ztree-input select, .ztree-chat-text');
        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            var values = typed[boxOf(input)];
            if (values == null || !(input.name in values)) continue;
            var v = values[input.name];
            if (input.type === 'radio') input.checked = String(input.value) === String(v);
            else if (input.type === 'checkbox') input.checked = v !== '' && v != null;
            else input.value = v;
            showSlider(input);
        }
    }

    function showSlider(input) {
        if (input.type === 'range' && input.nextElementSibling && input.nextElementSibling.tagName === 'OUTPUT') {
            input.nextElementSibling.textContent = input.value;
        }
    }

    /** Puts html in the visible screen, keeping what was typed and where the focus was. */
    function show(html) {
        var page = visibleScreen();
        if (page == null) return;
        var focus = document.activeElement;
        var focusName = focus && focus.name ? [boxOf(focus), focus.name] : null;
        page.innerHTML = html;
        restore(page);
        if (focusName) {
            var again = page.querySelector('.ztree-box[data-box="' + focusName[0] + '"] [name="' + focusName[1] + '"]');
            if (again && again.focus) again.focus();
        }
        tick();
    }

    function stageId() {
        return jt.data && jt.data.player && jt.data.player.stage ? jt.data.player.stage.id : null;
    }

    /** The values of a box's inputs (a contract creation or standard box), by variable. */
    function values(boxEl) {
        var out = {};
        var inputs = boxEl.querySelectorAll('.ztree-input input, .ztree-input select');
        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            if (input.type === 'radio') {
                if (input.checked) out[input.name] = input.value;
                else if (!(input.name in out)) out[input.name] = '';
            } else if (input.type === 'checkbox') {
                out[input.name] = input.checked ? input.value : '';
            } else {
                out[input.name] = input.value;
            }
        }
        return out;
    }

    function press(boxEl, button, extra) {
        var data = { stage: stageId(), box: boxEl.getAttribute('data-box'), button: button, values: values(boxEl), others: {} };
        // The other boxes' inputs (a standard box's button takes those of boxes with no buttons).
        var screen = boxEl.closest('.ztree-screen') || document;
        var boxes = screen.querySelectorAll('.ztree-box[data-box]');
        for (var i = 0; i < boxes.length; i++) {
            if (boxes[i] !== boxEl && boxes[i].querySelector('.ztree-input')) data.others[boxes[i].getAttribute('data-box')] = values(boxes[i]);
        }
        if (extra) data.itemButton = true;
        var chosen = boxEl.querySelector('.ztree-list input[type=radio]:checked');
        if (chosen) data.record = chosen.value;
        if (extra) for (var k in extra) data.values[k] = extra[k];
        jt.sendMessage('ztreeButton', data);
    }

    document.addEventListener('input', function (e) {
        if (e.target.closest && e.target.closest('.ztree-page')) {
            remember(e.target);
            showSlider(e.target);
        }
    });
    document.addEventListener('change', function (e) {
        if (e.target.closest && e.target.closest('.ztree-page')) remember(e.target);
    });
    document.addEventListener('click', function (e) {
        if (!e.target.closest) return;
        var button = e.target.closest('.ztree-button');
        if (button) {
            e.preventDefault();
            press(button.closest('.ztree-box'), Number(button.getAttribute('data-button')));
            return;
        }
        var itemButton = e.target.closest('.ztree-item-button');
        if (itemButton) {
            e.preventDefault();
            var extra = {};
            extra[itemButton.name] = itemButton.value;
            press(itemButton.closest('.ztree-box'), 0, extra);
            return;
        }
        var row = e.target.closest('.ztree-row');
        if (row) {
            var radio = row.querySelector('input[type=radio]');
            if (radio) radio.checked = true;
            var list = row.closest('.ztree-box');
            jt.sendMessage('ztreeSelect', { stage: stageId(), box: list.getAttribute('data-box'), record: row.getAttribute('data-record') });
        }
        var ok = e.target.closest('.ztree-message-ok');
        if (ok) {
            var message = ok.closest('.ztree-message');
            if (message) message.remove();
        }
    });
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' || !e.target.classList) return;
        if (e.target.classList.contains('ztree-chat-text')) {
            e.preventDefault();
            jt.sendMessage('ztreeChat', { stage: stageId(), box: e.target.getAttribute('data-box'), text: e.target.value });
            e.target.value = '';
            var box = boxOf(e.target);
            if (typed[box]) delete typed[box][e.target.name];
        } else if (e.target.closest && e.target.closest('.ztree-input')) {
            // Enter presses the box's first button.
            e.preventDefault();
            var b = e.target.closest('.ztree-box').querySelector('.ztree-button');
            if (b) b.click();
        }
    });

    /** z-Leaf's message box: the text and OK. */
    function message(text) {
        var old = document.querySelector('.ztree-message');
        if (old) old.remove();
        var div = document.createElement('div');
        div.className = 'ztree-message';
        div.innerHTML = '<div class="ztree-message-box"><div class="ztree-message-text"></div><button type="button" class="ztree-message-ok">OK</button></div>';
        div.querySelector('.ztree-message-text').textContent = text;
        document.body.appendChild(div);
        div.querySelector('.ztree-message-ok').focus();
    }

    /** The header box's remaining time, from the screen's deadline. */
    function tick() {
        var screen = document.querySelector('.ztree-page .ztree-screen[data-deadline]');
        var times = document.querySelectorAll('.ztree-page .ztree-header-time');
        for (var i = 0; i < times.length; i++) {
            var deadline = screen ? Number(screen.getAttribute('data-deadline')) : 0;
            var el = times[i].querySelector('.ztree-time');
            if (!deadline) {
                times[i].style.visibility = 'hidden';
                continue;
            }
            times[i].style.visibility = '';
            var left = Math.ceil((deadline - Date.now()) / 1000);
            if (left > 0) {
                if (el) el.textContent = left;
                times[i].classList.remove('ztree-header-time--over');
            } else if (!times[i].classList.contains('ztree-header-time--over')) {
                times[i].classList.add('ztree-header-time--over');
                times[i].textContent = times[i].getAttribute('data-timeout-text');
            }
        }
    }
    setInterval(tick, 250);

    var wait = setInterval(function () {
        if (window.jt == null || jt.socket == null) return;
        clearInterval(wait);
        jt.socket.on('ztreeScreen', function (d) {
            if (d.stage === stageId()) show(d.html);
        });
        jt.socket.on('ztreeMessage', function (d) { message(d.text); });
        jt.socket.on('ztreeAccepted', function (d) { delete typed[d.box]; });
        // Vue draws player.ztreeHtml anew when the player changes: keep what was typed.
        var after = jt.postUpdatePlayer;
        jt.postUpdatePlayer = function () {
            if (after) after.apply(this, arguments);
            setTimeout(function () {
                var page = visibleScreen();
                if (page) restore(page);
                tick();
            }, 0);
        };
    }, 50);
})();
