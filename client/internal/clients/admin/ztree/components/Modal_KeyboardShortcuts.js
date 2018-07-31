jt.Modal_KeyboardShortcuts = function(app) {
    var out = jt.Modal('keyboard-shortcuts', 'Keyboard Shortcuts');

    $('#content-window').append(out);

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

    $('#content-window').append(out);

    return out;

};

jt.showKeyboardShortcuts = function() {
    var modal = jt.KeyboardShortcutsModal();
    modal.modal('show');
}
