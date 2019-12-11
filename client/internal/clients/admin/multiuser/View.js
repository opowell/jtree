jt.confirm = function(text, ifYes) {
    $('#confirmQuestion').text(text);
    $('#confirmYesBtn').click(ifYes);
    $('#confirmModal').modal('show');
}

jt.execIfEnter = function(event, fn) {
    if (event.keyCode === 13) {
        fn();
    }
}

QueueAppDiv = function(app) {
    var text = app.appId;
    if (objLength(app.options) > 0) {
        text += '(';
    }
    for (var i in app.options) {
        text += i + '=' + app.options[i] + ', ';
    }
    if (objLength(app.options) > 0) {
        text = text.substring(0, text.length - 2);
        text += ')';
    }
    return $('<div style="white-space: normal; word-break: break-all">').text(text);
}

jt.disableButton = function(elId, html) {
    $('#' + elId).attr('disabled', true);
    $('#' + elId).addClass('disabled');
    $('#' + elId).removeClass('active');
    $('#' + elId).html(html);
}

jt.enableButton = function(elId, html) {
    $('#' + elId).attr('disabled', false);
    $('#' + elId).removeClass('disabled');
    $('#' + elId).html(html);
}

AppOptionRow = function(option, app, options) {
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

    var div = $('<tr>');
    var nameEl = $('<td>').text(option.name);
    div.append(nameEl);
    var tdSel = $('<td class="option-input">');
    div.append(tdSel);
    switch (option.type) {
        case 'select':
        var select = $('<select class="form-control view-app-option" app-option-name="' + option.name + '" id="view-app-option-' + option.name + '">');
        tdSel.append(select);
        for (var j in option.values) {
            var optEl = $('<option value="' + option.values[j] + '">' + option.values[j] + '</option>');
            if (selected !== undefined && selected == option.values[j]) {
                optEl.prop('selected', true);
            }
            select.append(optEl);
        }
        break;
        case 'text':
            var input = $('<input type="text" class="form-control" app-option-name="' + option.name + '" id="view-app-option-' + option.name + '">');
            input.val(option.defaultVal);
            tdSel.append(input);
            break;
        case 'number':
            var tagText = '<input type="number" class="form-control"';
            if (option.min !== null) {
                tagText += ' min=' + option.min;
            }
            if (option.max !== null) {
                tagText += ' max=' + option.max;
            }

            if (option.step !== null) {
                tagText += ' step=' + option.step;
            }
            if (selected !== null && selected !== undefined) {
                tagText += ' value=' + selected;
            } else {
                tagText += ' value=' + option.defaultVal;
            }
            var input = $(tagText + ' class="view-app-option form-control" app-option-name="' + option.name + '" id="view-app-option-' + option.name + '">');
            tdSel.append(input);
            break;
    }
    var description = option.description;
    if (description === undefined) {
        description = 'None given.';
    }
    div.append($('<td>').html(description));
    return div;

}

EditOptionDivLabel = function(option) {
    return $('<label for="view-app-option-' + option.name + '" class="option-label col-form-label">').text(option.name + ': ');
}

EditOptionDivInput = function(option, obj, optionVals) {
    let selected = undefined;
    if (obj[option.name] !== undefined) {
        selected = obj[option.name];
    }
    if (option.defaultVal !== undefined) {
        selected = option.defaultVal;
    }
    if (optionVals !== undefined && optionVals[option.name] !== undefined) {
        selected = optionVals[option.name];
    }
    let el;
    switch (option.type) {
        case 'select':
        el = $('<select class="view-app-option" app-option-name="' + option.name + '" id="view-app-option-' + option.name + '">');
        for (var j in option.values) {
            var optEl = $('<option value="' + option.values[j] + '">' + option.values[j] + '</option>');
            if (selected !== undefined && selected == option.values[j]) {
                optEl.prop('selected', true);
            }
            el.append(optEl);
        }
        break;
        case 'text':
            el = $('<input type="text" app-option-name="' + option.name + '" id="view-app-option-' + option.name + '">');
            el.val(option.defaultVal);
            break;
        case 'number':
            let tagText = '<input type="number" ';
            if (option.min !== null) {
                tagText += ' min=' + option.min;
            }
            if (option.max !== null) {
                tagText += ' max=' + option.max;
            }

            if (option.step !== null) {
                tagText += ' step=' + option.step;
            }
            if (selected !== null && selected !== undefined) {
                tagText += ' value=' + selected;
            } else {
                tagText += ' value=' + option.defaultVal;
            }
            el = $(tagText + ' class="view-app-option" app-option-name="' + option.name + '" id="view-app-option-' + option.name + '">');
            break;
    }
    return el;
}

EditOptionDiv = function(option, obj, optionVals) {
    var div = $('<div class="form-group option-div">');
    var nameEl = EditOptionDivLabel(option);
    div.append(nameEl);
    var tdSel = $('<div class="option-input">');
    let input = EditOptionDivInput(option, obj, optionVals);
    input.addClass('form-control');
    tdSel.append(input);
    div.append(tdSel);
    var descEl = $('<div class="col-form-label">').html(option.description);
    div.append(descEl);
    return div;
}

OptionRow = function(option, obj, optionVals) {
    var selected = undefined;
    if (option.values !== undefined) {
        selected = option.values[0];
    }
    if (option.defaultVal !== undefined) {
        selected = option.defaultVal;
    }
    if (obj[option.name] !== undefined) {
        selected = obj[option.name];
    }
    if (optionVals !== undefined && optionVals[option.name] !== undefined) {
        selected = optionVals[option.name];
    }
    var div = $('<div style="white-space: initial">').text(option.name + ': ' + JSON.stringify(selected));
    return div;
}

jt.AppRow = function(app, options, cols) {

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
            switch(col) {
            case '#':
                row.append($('<td>').text(app.index));
                break;
            case 'id':
                row.append($(`
                    <td>
                        <div>${app.shortId}</div>
                        <div><small style='white-space: normal' class='text-muted'>${app.id}</small></div>
                    </td>    
                `));
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
                        let div = new OptionRow(app.options[i], app, options);
                        optionsEl.append(div);
                    }
                    row.append(optionsEl);
                    break;
            case 'options':
                var optionsEl = $('<td style="display: flex; flex-wrap: wrap; padding-top: calc(.375rem - 1px);">');
                for (var i in app.options) {
                    var option = app.options[i];
                    var div = EditOptionDiv(option, app, options);
                    optionsEl.append(div);
                }
                row.append(optionsEl);
                break;
            }
        }

    } catch (err) {}

    return row;
}

jt.UserRow = function(user, cols) {

    if (cols === undefined) {
        cols = ['id'];
    }

    var row = $('<tr>');

    try {

        row.data('userId', user.id);

        for (var i in cols) {
            var col = cols[i];
            switch(col) {
            case 'id':
                row.append($('<td>').text(user.id));
                break;
            case 'type':
                row.append($('<td>').text(user.type));
                break;
            }
        }

    } catch (err) {}

    return row;
}

// DRAG-DROP UI
function CardPanel(id, title, contentEl) {
    var cardBlock = $('<div class="card-block panel-content">');
    cardBlock.append(contentEl);
    var card = new Panel(id, title, cardBlock);
    return card;
}

function addCardPanel(id, title, contentEl) {
    var panel = new CardPanel(id, title, contentEl);
    panel.attr('hidden', true);
    $('body').append(panel);
    return panel;
}
function addPanel(id, title, contentEl) {
    var panel = new Panel(id, title, contentEl);
    panel.attr('hidden', true);
    $('body').append(panel);
    return panel;
}

function showPanel(t, tt, ll, hh, ww, bb, rr, override) {
    var el = $(t.replace(/\./g, '\\.'));
    el.removeAttr('hidden');
}

function Panel(id, title, contentEl) {
    var card;
    var search = $('#panel-' + id);
    if (search.length > 0) {
        card = $(search[0]);
    } else {
        card = $('<div class="card panel ui-widget-content">');
        card.attr('id', 'panel-' + id);
        var cardHeader = $('<div>');
        cardHeader.addClass('card-header');
        card.append(cardHeader);
        var headerText = $('<span>').text(title);
        cardHeader.append(headerText);
    }
    // Set z-Index
    if (contentEl !== null) {
        // Close previous view, if any.
        $(card).find('.panel-content2').remove();

        card.append(contentEl);
        $(contentEl).addClass('panel-content2');
    }
    return card;
}

jt.QueueRow = function(queue, cols) {

    if (cols === undefined) {
        cols = ['id', 'apps'];
    }

    var row = $('<tr>');

    row.data('queueId', queue.id);

    for (var i in cols) {
        var col = cols[i];
        switch(col) {
        case 'id':
            row.append($('<td style="white-space: normal; word-break: break-all">').text(queue.id));
            break;
        case 'apps':
            var appsEl = $('<td style="white-space: normal; word-break: break-all">');
            for (var i in queue.apps) {
                var app = queue.apps[i];
                var div = QueueAppDiv(app);
                appsEl.append(div);
            }
            row.append(appsEl);
            break;
        }
    }

    return row;
}

jt.DeleteButton = function() {
    return $(`<button class="btn btn-sm btn-outline-secondary">
        <i class="fa fa-trash" title="delete"></i>
    </button>`);
}

jt.CopyButton = function() {
    return $(`<button class="btn btn-sm btn-outline-secondary">
        <i class="fa fa-copy" title="copy"></i>
    </button>`);
}

jt.PlayerRow = function(player) {
    var div = $('<tr class="player-' + player.id +'">');
    div.append($('<td>').text(player.id));
    return div;
}

jt.setSubView = function(viewName, subViewName) {
    $('.' + viewName + '-tab').addClass('hidden');
    $('#view-' + viewName + '-' + subViewName).removeClass('hidden');
    $('.' + viewName + '-tabBtn').removeClass('active');
    $('#tab-' + viewName + '-' + subViewName).addClass('active');
}

function CustomAppFolder(folder) {
    var div = $('<div>');
    div.addClass('custom-app-folder');
    var location = $('<div>').text(folder);
    location.addClass('custom-app-folder-location');
    div.append(location);
    var actions = $('<div>');
    actions.addClass('actions');
    div.append(actions);
    var fol = folder;
    var removeBtn = $('<a>')
        .click(fol, removeCustomAppFolder)
        .text("remove")
        .addClass('btn')
        .addClass('btn-sm')
        .addClass('btn-secondary')
        .attr('href', '#')
        .attr('role', 'button');
    actions.append(removeBtn);
    return div;
}

function showPlayerCurApp(participant) {
    var appText = participant.appIndex + '-';
    if (participant.appIndex < 1 || participant.appIndex > jt.data.session.apps.length) {
    } else {
        var app = jt.data.session.apps[participant.appIndex-1];
        appText = appText + app.shortId;
    }
    $('#app-' + safePId(participant.id)).text(appText);
//    $('.participant-' + participant.id + '-appIndex').text(participant.appIndex);
}

function openClient(event) {
    // TODO
}

function showAppFolders(folders) {
    $('#custom-app-folders').empty();
    for (var i in folders) {
        var folder = folders[i];
        showCustomAppFolder(folder);
    }
}

function showCustomAppFolder(folder) {
    var folderRow = new CustomAppFolder(folder);
    $('#custom-app-folders').append(folderRow);
}

jt.addAppToNewSessionQueue = function(id) {
    var div = $('<span class="view-apps-queue-app">').text(id);
    $('#view-apps-queue').append(div);
}

function showSessionAppName(an) {
    $('#sessionAppName').text(an);
}

function showPId(id) {
    $('#jt-admin-menu-login').text(id);
}
