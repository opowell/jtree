jt.Modal_AppProperties = function() {
    var out = jt.Modal('app-properties', 'General Parameters');
    var body = out.find('.modal-body');

    var center = jt.Box_Grid(2, body);

    var right = jt.Box_Standard(body);
    jt.Item_Button('OK', function(ev) {
        ev.stopPropagation();
        jt.Modal_AppProperties_save();
        jt.closeModal();
    }, right);

    var cancelBtn = jt.Item_Button('Cancel', function(ev) {
        ev.stopPropagation();
        jt.closeModal();
    }, right);

    return out;
};

jt.Modal_AppProperties_init = function() {
    var modal = jt.Modal_AppProperties();
    $('#content-window').append(modal);
}

jt.Modal_AppProperties_show = function(app) {

    var modal = $('#app-properties-modal');
    modal.data('app', app);

    let center = modal.find('.modal-body').find('.zt-gridbox');
    center.empty();

    const fieldsToSkip = ['stages', 'indexInSession', 'periods', 'id', 'appjs'];

    for (var i in app) {
        if (fieldsToSkip.includes(i)) {
            continue;
        }
        let name = i;
        let type = 'field';
        if (i.startsWith('__func_')) {
            name = i.slice('__func_'.length);
            type = 'function';
        }
        var input = jt.Item_Input(name, 'app-properties-modal-' + i, null, app[i]);
        input.children().attr('field-name', i);
        input.children().attr('original-value', app[i]);
        input.children().keyup(function(ev) {
            if (ev.key == 'Enter') {
                ev.stopPropagation();
                jt.Modal_AppProperties_save();
                jt.closeModal();
            }
        });
        center.append(input.children());
    }

    modal.modal('show');
}

jt.Modal_AppProperties_save = function() {
    var modal = $('#app-properties-modal');
    let inputs = modal.find('[id^="app-properties-modal-"]');
    let code = modal.data('app').appjs;
    let appPath = modal.data('app').appPath;
    for (let i=0; i<inputs.length; i++) {
        let input = inputs[i];
        let origVal = $(input).attr('original-value');
        let newVal = $(input).val();
        let field = $(input).attr('field-name');
        if (origVal != newVal) {
            let searchStr = 'app.' + field + ' = ' + origVal;
            let replStr = 'app.' + field + ' = ' + newVal;
            if (code.includes(searchStr)) {
                code = code.replace(searchStr, replStr);
            } else {
                code = code + '\n' + replStr;
            }
        }
    }
    var cb = 'jt.Panel_Treatment_SetTreeId(message.appPath, message.app)';
    server.setAppContents(appPath, code, cb);
}
