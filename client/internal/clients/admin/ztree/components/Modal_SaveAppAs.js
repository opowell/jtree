jt.Modal_SaveAppAs = function(curTitle) {
    var out = jt.Modal('prompt-for-app-name', 'Save Treatment as...');

    $('#content-window').append(out);

    var body = out.find('.modal-body');

    //  style='height: 87vh; width: 100%;
    var editorDiv = $(`
        <div style='display: grid; grid-template-columns: 1fr 1fr;'>
            <span>File name:</span>
            <input id='save-app-as-input' type='text' value='${curTitle}'>
            <span>File extension:</span>
            <select id='save-app-as-extension'>
                <option value='jtt' selected>.jtt - can send via email</option>
                <option value='js'>.js - automatically recognized by text editors</option>
            </select>
        </div>`);

    body.append(editorDiv);

    var right = jt.StandardBox(body);
    jt.Button('OK', function(ev) {
        ev.stopPropagation();
        var fn = $('#save-app-as-input').value();
        server.sa
        jt.closeModal();
    }, right);

    var cancelBtn = jt.Button('Cancel', function(ev) {
        ev.stopPropagation();
        jt.closeModal();
    }, right);

    $('#content-window').append(out);

    out.modal('show');

    $('#save-app-as-input')[0].setSelectionRange(0, curTitle.length);

};
