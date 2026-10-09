// oTree apps' pages in jtree (see server/source/dialects/otree): a page arrives as HTML in
// player.otreeHtml. This runs the scripts in it (HTML put in the page does not run them), with
// js_vars set first, and gives them liveSend(data) and liveRecv(data) for live pages.
(function() {
    // The page's live_method gets data; what it returns for this player comes to liveRecv.
    window.liveSend = function(data) {
        jt.sendMessage('liveSend', data);
    };

    var shown = null;
    var countdown = null;

    // oTree's page timer: counts down from data-seconds, from when the page is shown.
    function startTimer(page) {
        clearInterval(countdown);
        var span = page.querySelector('.otree-timer__time-left');
        if (span == null) {
            return;
        }
        var end = Date.now() + Number(span.getAttribute('data-seconds')) * 1000;
        var show = function() {
            var left = Math.max(0, Math.round((end - Date.now()) / 1000));
            span.textContent = Math.floor(left / 60) + ':' + ('0' + (left % 60)).slice(-2);
            if (left === 0) {
                clearInterval(countdown);
            }
        };
        show();
        countdown = setInterval(show, 1000);
    }

    // Runs the scripts of a page that has just been rendered, once.
    function runScripts() {
        var page = document.querySelector('.otree-content');
        if (page == null || jt.data == null || jt.data.player == null) {
            return;
        }
        // Started for what is in the page now (Vue puts a new page's HTML in the same element, as
        // new nodes): not for the player's data, which may come before Vue has drawn it.
        var first = page.firstChild;
        if (first == null || first === shown) {
            return;
        }
        shown = first;
        startTimer(page);
        startChats(page);
        window.js_vars = jt.data.player.otreeJsVars || {};
        window.liveRecv = undefined;
        var scripts = page.querySelectorAll('script');
        for (var i = 0; i < scripts.length; i++) {
            var old = scripts[i];
            var script = document.createElement('script');
            for (var a = 0; a < old.attributes.length; a++) {
                script.setAttribute(old.attributes[a].name, old.attributes[a].value);
            }
            script.text = old.text;
            old.parentNode.replaceChild(script, old);
        }
    }

    // oTree's chat boxes ({{ chat }}): join each, show what was and is said, send.
    function startChats(page) {
        var boxes = page.querySelectorAll('.otree-chat');
        for (var i = 0; i < boxes.length; i++) {
            (function(box) {
                var channel = box.getAttribute('data-channel');
                var input = box.querySelector('.otree-chat__input');
                var send = function() {
                    if (input.value.trim() !== '') {
                        jt.sendMessage('otreeChat', { channel: channel, body: input.value });
                        input.value = '';
                    }
                };
                box.querySelector('.otree-chat__send').addEventListener('click', send);
                input.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        send();
                    }
                });
                jt.sendMessage('otreeChatJoin', { channel: channel });
            })(boxes[i]);
        }
    }

    function showChatMessage(channel, message) {
        var boxes = document.querySelectorAll('.otree-content .otree-chat');
        for (var i = 0; i < boxes.length; i++) {
            if (boxes[i].getAttribute('data-channel') === channel) {
                var list = boxes[i].querySelector('.otree-chat__messages');
                var line = document.createElement('div');
                var who = document.createElement('b');
                who.textContent = message.nickname + ': ';
                line.appendChild(who);
                line.appendChild(document.createTextNode(message.body));
                list.appendChild(line);
                list.scrollTop = list.scrollHeight;
            }
        }
    }

    // After each update of the player, once Vue has rendered it.
    function hook() {
        var after = jt.postUpdatePlayer;
        jt.postUpdatePlayer = function() {
            after.apply(this, arguments);
            if (window.Vue != null) {
                Vue.nextTick(runScripts);
            } else {
                setTimeout(runScripts, 0);
            }
        };
        var wait = setInterval(function() {
            if (jt.socket != null) {
                clearInterval(wait);
                jt.socket.on('liveRecv', function(data) {
                    if (typeof window.liveRecv === 'function') {
                        window.liveRecv(data);
                    }
                });
                jt.socket.on('otreeChatHistory', function(data) {
                    for (var i = 0; i < data.messages.length; i++) {
                        showChatMessage(data.channel, data.messages[i]);
                    }
                });
                jt.socket.on('otreeChatMessage', function(data) {
                    showChatMessage(data.channel, data.message);
                });
            }
        }, 50);
        // The page may have been rendered before this hooked in, or after the last update's hook.
        setTimeout(runScripts, 0);
        setInterval(runScripts, 250);
    }

    // A clicked button with a name submits its value, as on oTree's pages
    // (<button name="cooperate" value="True">): put them in the form before it is submitted.
    document.addEventListener('click', function(event) {
        var button = event.target.closest ? event.target.closest('.otree-content button[name]') : null;
        if (button == null || button.form == null) {
            return;
        }
        var old = button.form.querySelectorAll('input[data-otree-button]');
        for (var i = 0; i < old.length; i++) {
            old[i].parentNode.removeChild(old[i]);
        }
        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = button.name;
        input.value = button.value;
        input.setAttribute('data-otree-button', '');
        button.form.appendChild(input);
    }, true);

    // jtree's own scripts set jt.postUpdatePlayer as they load: hook in after them.
    window.addEventListener('load', hook);
})();
