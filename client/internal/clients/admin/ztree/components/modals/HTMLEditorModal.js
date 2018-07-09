jt.HTMLEditorModal = function() {
    var out = jt.Modal('html-editor', 'HTML Editor');

    $('#content-window').append(out);

    var body = out.find('.modal-body');

    let editor = `<div id='html-editor' style='height: 87vh; width: 100%;'></div>`;

    body.append(editor);

    var right = jt.StandardBox(body);
    jt.Button('OK', function(ev) {
        ev.stopPropagation();
        jt.storeHTML();
        jt.closeModal();
    }, right);

    var cancelBtn = jt.Button('Cancel', function(ev) {
        ev.stopPropagation();
        jt.closeModal();
    }, right);

    ace.edit(editor, {
        mode: 'ace/mode/javascript',
        selectionStyle: 'text'
    });
};

jt.HTMLEditorModal_editData = function(data) {
    var editor = ace.edit('html-editor')
    editor.setValue(data);
    editor.setSe
    $('#html-editor-modal').modal('show');
}

jt.storeHTML = function() {
    
}
