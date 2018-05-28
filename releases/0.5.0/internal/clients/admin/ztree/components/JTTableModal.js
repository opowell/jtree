jt.TableModal = function() {
    var out = jt.Modal('table', 'Table');
    var body = out.find('.modal-body');

    var center = jt.gridBox(1, body);
    jt.input('Name', 'table-modal-name', center);

    var lifetimeContent = `
    <input type="radio" name="lifetime" id='period'>
    <label for="period">Period</label><br>
    <input type="radio" name="lifetime" id='treatment'>
    <label for="treatment">Treatment</label><br>
    <input type="radio" name="lifetime" id='session'>
    <label for="session">Session</label><br>
    `;

    jt.tackyBox('Lifetime', lifetimeContent, center);

    lifetimeContent = jt.radioSelect(
        'lifetime',
        ['Period', 'Treatment', 'Session']
    );

    jt.tackyBox('Lifetime', lifetimeContent, center);

    jt.tackyBox('Program execution', 'When first subject enters stage', center);

    var right = jt.standardBox(body);
    jt.button('OK', function(ev) {
        ev.stopPropagation();
        jt.storeTableInfo();
        jt.closeModal();
    }, right);

    var cancelBtn = jt.button('Cancel', function(ev) {
        ev.stopPropagation();
        jt.closeModal();
    }, right);

};

jt.storeTableInfo = function() {}

jt.showTableModal = function(table) {
    $('#table-modal .modal-title').text(table.name);
    jt.showModal('table');
}

jt.input = function(title, id, parentEl) {
    var out = $(`
        <div>
            <span>${title}</span>
            <input id='${id}'>
        </div>
    `);
    if (parentEl != null) {
        $(parentEl).append(out);
    }
    return out;
}

jt.gridBox = function(numCols, parentEl) {
    var cols = '';
    for (var i=0; i<numCols; i++) {
        cols = cols + 'auto ';
    }
    cols = cols + ';';

    var out = $(`
        <div class='zt-gridbox' style='grid-template-columns: ${cols}'>
        </div>
    `);

    if (parentEl != null) {
        $(parentEl).append(out);
    }

    return out;
}

jt.standardBox = function(parentEl) {
    var out = $(`
        <div class='zt-standardbox'>
        </div>
    `);

    if (parentEl != null) {
        $(parentEl).append(out);
    }

    return out;
}

// content: either an html string, or a set of elements
jt.tackyBox = function(title, content, parentEl) {
    var out = $(`
        <div class='tackyBox'>
            <span class='tackyBox-title'>${title}</span>
            <div class='tackyBox-content'></div>
        </div>
    `);

    if (!Array.isArray(content)) {
        out.find('.tackyBox-content').html(content);
    } else {
        for (var i=0; i<content.length; i++) {
            out.find('.tackyBox-content').append(content[i]);
        }
    }

    if (parentEl != null) {
        $(parentEl).append(out);
    }
    return out;
}

jt.radioSelect = function(id, options) {

    var out = [];
    for (var i=0; i<options.length; i++) {
        var option = options[i];
        out.push(`<input type="radio" name="${id}" id='${option}'>`)
        out.push(`<label for="${option}">${option}</label><br>`);
    }
    return out;

}

jt.button = function(text, fn, parentEl) {
    var out = $(`
        <div class='zt-button' tabindex='0'>
            ${text}
        </div>
    `);
    out.click(fn);
    out.bind('keydown', 'return', fn);
    out.bind('keydown', 'space', fn);

    if (parentEl != null) {
        $(parentEl).append(out);
    }
    return out;
}
