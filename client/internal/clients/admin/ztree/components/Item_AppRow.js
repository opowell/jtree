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
                    var optionsEl = $('<td>');
                    for (var i in app.options) {
                        var option = app.options[i];
                        var selected = undefined;
                        if (option.values !== undefined) {
                            selected = option.values[0];
                        }
                        if (option.defaultVal !== undefined) {
                            selected = option.defaultVal;
                        }
                        if (app[option.name] !== undefined) {
                            selected = app[option.name];
                        }
                        if (options !== undefined && options[option.name] !== undefined) {
                            selected = options[option.name];
                        }
                        var div = $('<div>').text(option.name + ': ' + selected);
                        optionsEl.append(div);
                    }
                    row.append(optionsEl);
                    break;
                case 'options':
                    var optionsEl = $('<td style="display: flex; flex-wrap: wrap; padding-top: calc(.375rem - 1px);">');
                    for (var i in app.options) {
                        var option = app.options[i];
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
                        var div = AppOptionDiv(option, selected);
                        optionsEl.append(div);
                    }
                    row.append(optionsEl);
                    break;
            }
        }

    } catch (err) {}

    return row;
}