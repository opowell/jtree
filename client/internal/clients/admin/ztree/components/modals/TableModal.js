jt.TableModal = function() {
    var out = jt.Modal('table', 'Table');

    var body = out.find('.modal-body');

    var center = jt.GridBox(1, body);
    jt.Input('Name', 'table-modal-name', center, '');

    var lifetimeContent = `
    <input type="radio" name="lifetime" id='period'>
    <label for="period">Period</label><br>
    <input type="radio" name="lifetime" id='treatment'>
    <label for="treatment">Treatment</label><br>
    <input type="radio" name="lifetime" id='session'>
    <label for="session">Session</label><br>
    `;

    jt.TackyBox('Lifetime', lifetimeContent, center);

    lifetimeContent = jt.RadioSelect(
        'lifetime',
        ['Period', 'Treatment', 'Session']
    );

    jt.TackyBox('Lifetime', lifetimeContent, center);

    jt.TackyBox('Program execution', 'When first subject enters stage', center);

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

    $('body').append(out);
};

jt.storeTableInfo = function() {}

jt.showTableModal = function(table) {
    $('#table-modal .modal-title').text(table.name);
    jt.showModal('table');
}
