jt.Modal_Editor = function() {
    var out = jt.Modal('editor', 'Editor', {draggable: false});

    $('#content-window').append(out);

    var body = out.find('.modal-body');

    let editor = `<div id='editor' style='height: 87vh; width: 87vw;'></div>`;

    body.append(editor);

    var right = jt.Box_Standard(body);
    jt.Item_Button('OK', function(ev) {
        ev.stopPropagation();
        jt.Modal_Editor_ClickOK();
        jt.closeModal();
    }, right);

    var cancelBtn = jt.Item_Button('Cancel', function(ev) {
        ev.stopPropagation();
        jt.closeModal();
    }, right);

    ace.edit('editor', {
        selectionStyle: 'text'
    });
};

jt.Modal_Editor_editData = function(data, mode) {
    var editor = ace.edit('editor');
    editor.setValue(data);
    editor.setMode(mode);
    editor.clearSelection();
    editor.moveCursorTo(0, 0);
    editor.focus();
    $('#editor').modal('show');
}

jt.Modal_Editor_init = function() {
    var modal = jt.Modal_Editor();
}

jt.Model_Editor_ClickOK = function() {

}
