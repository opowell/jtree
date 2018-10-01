jt.Modal_TreatmentCode = function() {
    var out = jt.Modal('treatment-code', 'Code', {draggable: false});

    $('#content-window').append(out);

    var body = out.find('.modal-body');

    //  style='height: 87vh; width: 100%;
    var editorDiv = $(`<div class='treatment-code-editor jt-editor' id='treatment-code-editor'></div>`);

    body.append(editorDiv);

    var right = jt.Box_Standard(body);
    jt.Item_Button('OK', function(ev) {
        jt.Modal_TreamtmentCode_ClickOK(ev);
    }, right);

    var cancelBtn = jt.Item_Button('Cancel', function(ev) {
        ev.stopPropagation();
        jt.closeModal();
    }, right);

    $('#content-window').append(out);

    jt.editor = ace.edit(editorDiv[0], {
        mode: 'ace/mode/javascript',
        selectionStyle: 'text',
        autoScrollEditorIntoView: true
    });

};

jt.Modal_TreatmentCode_init = function() {
    var sam = jt.Modal_TreatmentCode();
    $('body').append(sam);
}

jt.Modal_TreatmentCode_show = function(app) {
    let out = $('#treatment-code-modal');
    out.data('app', app);
    let editor = ace.edit(out.find('#treatment-code-editor')[0]);
    editor.setValue(app.appjs);
    editor.clearSelection();
    editor.moveCursorTo(0, 0);
    editor.focus();
    out.modal('show');
}

jt.Modal_TreamtmentCode_ClickOK = function(ev) {
    ev.stopPropagation();
    var editor = ace.edit('treatment-code-editor');
    let appPath = $(ev.target.closest('#treatment-code-modal')).data('app').appPath;
    var contents = editor.getValue();
    jt.closeModal();
    var cb = 'jt.Panel_Treatment_SetTreeId(message.appPath, message.app)';
    server.setAppContents(appPath, contents, cb);
}
