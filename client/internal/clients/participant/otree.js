// oTree apps' pages in jtree (see server/source/dialects/otree): a page arrives as HTML in
// player.otreeHtml. This runs the scripts in it (HTML put in the page does not run them), with
// js_vars set first, and gives them liveSend(data) and liveRecv(data) for live pages.
(function() {
    // The page's live_method gets data; what it returns for this player comes to liveRecv.
    window.liveSend = function(data) {
        jt.sendMessage('liveSend', data);
    };

    var shown = null;

    // Runs the scripts of a page that has just been rendered, once.
    function runScripts() {
        var page = document.querySelector('.otree-page');
        if (page == null || jt.data == null || jt.data.player == null) {
            return;
        }
        var html = jt.data.player.otreeHtml;
        if (html == null || html === shown) {
            return;
        }
        shown = html;
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
            }
        }, 50);
        // The page may have been rendered before this hooked in.
        setTimeout(runScripts, 0);
    }

    // jtree's own scripts set jt.postUpdatePlayer as they load: hook in after them.
    window.addEventListener('load', hook);
})();
