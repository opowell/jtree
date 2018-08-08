jt.Modal_KeyboardShortcuts = function(app) {
    var out = jt.Modal('keyboard-shortcuts', 'Keyboard Shortcuts');

    var body = out.find('.modal-body');

    //  style='height: 87vh; width: 100%;
    var div = $(`
        <div style='display: grid; grid-template-columns: 1fr 1fr;'>
        </div>
    `);

    for (var i in jt.keyboardShortcuts) {
        let shortcut = jt.keyboardShortcuts[i];
        div.append($(`<span>${shortcut.key}</span><span>${shortcut.fn}</span>`));
    }

    body.append(div);

    return out;

};

jt.Modal_KeyboardShortcuts_show = function() {
    $('#keyboard-shortcuts-modal').modal('show');
}

jt.Modal_KeyboardShortcuts_init = function() {
    var modal = jt.Modal_KeyboardShortcuts();
    $('#content-window').append(modal);
}
