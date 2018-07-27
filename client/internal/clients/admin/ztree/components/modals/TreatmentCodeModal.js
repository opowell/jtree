jt.TreatmentCodeModal = function(app) {
    var out = jt.Modal('treatment-code', 'Code');

    $('#content-window').append(out);

    var body = out.find('.modal-body');

    var editor = $(`<div id='treatment-code-editor' style='height: 87vh; width: 100%;'>${app.appjs}</div>`);

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

    $('#content-window').append(out);

    ace.edit(editor[0], {
        mode: 'ace/mode/javascript',
        selectionStyle: 'text'
    });

    return out;
};

jt.storeHTML = function() {

}
