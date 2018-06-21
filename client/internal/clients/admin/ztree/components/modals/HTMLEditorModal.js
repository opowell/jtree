jt.HTMLEditorModal = function() {
    var out = jt.Modal('html-editor', 'HTML Editor');

    $('#content-window').append(out);

    var body = out.find('.modal-body');

    body.append(`<div id='app-editor' style='height: 87vh; width: 100%;'></div>`);

    var right = jt.StandardBox(body);
    jt.Button('OK', function(ev) {
        ev.stopPropagation();
        jt.storeTableInfo();
        jt.closeModal();
    }, right);

    var cancelBtn = jt.Button('Cancel', function(ev) {
        ev.stopPropagation();
        jt.closeModal();
    }, right);
};

jt.HTMLEditorModal_editData(data) {
    $('#html-editor-modal').modal('show');
}
