jt.AppPropertiesModal = function(app) {
    var out = jt.Modal('app-properties', 'Properties');
    var body = out.find('.modal-body');

    var center = jt.GridBox(1, body);

    for (var i in app) {
        let name = i;
        let type = 'field';
        if (i.startsWith('__func_')) {
            name = i.slice('__func_'.length);
            type = 'function';
        }
        jt.Input(name, 'app-properties-modal-' + i, center);
    }

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

    return out;
};

jt.showAppPropertiesModal = function(app) {
    var modal = jt.AppPropertiesModal(app);
    $('#content-window').append(modal);
}
