jt.Modal_AppProperties = function(app) {
    var out = jt.Modal('app-properties', 'General Parameters');
    var body = out.find('.modal-body');

    var center = jt.GridBox(2, body);

    const fieldsToSkip = ['stages', 'indexInSession', 'periods', 'id', 'appjs']

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
        var input = jt.Input(name, 'app-properties-modal-' + i, null, app[i]);
        center.append(input.children());
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
    modal.modal('show');
}
