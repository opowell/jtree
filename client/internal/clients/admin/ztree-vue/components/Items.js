jt.Item_RadioSelect = function(id, options) {

    var out = [];
    for (var i=0; i<options.length; i++) {
        var option = options[i];
        out.push(`<input type="radio" name="${id}" id='${option}'>`)
        out.push(`<label for="${option}">${option}</label><br>`);
    }
    return out;

}

/**
 * text - the text of the button.
 * fn - the function to call when the button is clicked.
 * parentEl - the element to append the button to.
 */
jt.Item_Button = function(text, fn, parentEl) {
    var out = $(`
        <div class='zt-button' tabindex='0'>
            ${text}
        </div>
    `);
    out.click(function(ev) {
        fn(ev);
    });
    out.bind('keydown', 'return', fn);
    out.bind('keydown', 'space', fn);

    if (parentEl != null) {
        $(parentEl).append(out);
    }
    return out;
}

jt.Item_Input = function(title, id, parentEl, value) {
    var out = $(`
        <div class='jt-input'>
            <span style='text-align: right; padding-right: 5px;'>${title}</span>
            <input id='${id}' value='${value}'>
        </div>
    `);
    if (parentEl != null) {
        $(parentEl).append(out);
    }
    return out;
}

jt.Item_AppRow = function(app, options, cols) {

    if (cols === undefined) {
        cols = ['id', 'name', 'description'];
    }

    var row = $('<tr>');

    if (app.indexInSession !== undefined) {
        app.index = app.indexInSession;
    }

    if (app.indexInQueue !== undefined) {
        app.index = app.indexInQueue;
    }

    try {

        row.data('appId', app.id);

        for (var i in cols) {
            var col = cols[i];
            switch (col) {
                case '#':
                    row.append($('<td>').text(app.index));
                    break;
                case 'id':
                    row.append($('<td>').text(app.id));
                    break;
                case 'path':
                    row.append($('<td>').text(app.appPath));
                    break;
                case 'description':
                    var color = '#000';
                    if (app.description === 'No description provided.') {
                        color = '#AAA';
                    }
                    row.append($('<td style="white-space: normal; color: ' + color + ';">').html((app.description)));
                    break;
                case 'name':
                    row.append($('<td>').text((app.name !== undefined ? app.name : app.id)));
                    break;
                case 'optionsView':
                    // var optionsEl = $('<td style="display: flex; flex-wrap: wrap; padding-top: calc(.375rem - 1px);">');
                    var optionsViewEl = $('<td>');
                    for (var k in app.options) {
                        var optionV = app.options[k];
                        var selectedV = undefined;
                        if (optionV.values !== undefined) {
                            selectedV = optionV.values[0];
                        }
                        if (optionV.defaultVal !== undefined) {
                            selectedV = optionV.defaultVal;
                        }
                        if (app[optionV.name] !== undefined) {
                            selectedV = app[optionV.name];
                        }
                        if (options !== undefined && options[optionV.name] !== undefined) {
                            selectedV = options[optionV.name];
                        }
                        var div = $('<div>').text(optionV.name + ': ' + selectedV);
                        optionsEl.append(div);
                    }
                    row.append(optionsViewEl);
                    break;
                case 'options':
                    var optionsEl = $('<td style="display: flex; flex-wrap: wrap; padding-top: calc(.375rem - 1px);">');
                    for (var j in app.options) {
                        var option = app.options[j];
                        var selected = undefined;
                        if (app[option.name] !== undefined) {
                            selected = app[option.name];
                        }
                        if (option.defaultVal !== undefined) {
                            selected = option.defaultVal;
                        }
                        if (options !== undefined && options[option.name] !== undefined) {
                            selected = options[option.name];
                        }
                        var divOpt = AppOptionDiv(option, selected);
                        optionsEl.append(divOpt);
                    }
                    row.append(optionsEl);
                    break;
            }
        }

    } catch (err) {}

    return row;
}
