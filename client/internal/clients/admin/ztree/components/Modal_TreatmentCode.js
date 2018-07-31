jt.Modal_TreatmentCode = function(app) {
    var out = jt.Modal('treatment-code', 'Code');

    $('#content-window').append(out);

    var body = out.find('.modal-body');

    //  style='height: 87vh; width: 100%;
    var editorDiv = $(`<div class='treatment-code-editor'>${app.appjs}</div>`);

    body.append(editorDiv);

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

    $('#content-window').append(out);

    out.modal('show');

    jt.editor = ace.edit(editorDiv[0], {
        mode: 'ace/mode/javascript',
        selectionStyle: 'text',
        autoScrollEditorIntoView: true
    });

};

jt.storeHTML = function() {

}
