
import jt from '@/webcomps/jtree.js'
import 'jquery'
let $ = window.jQuery;
import Utils from '@/webcomps/utilsFns.js';

jt.confirm = function(text, ifYes) {
    $('#confirmQuestion').text(text);
    $('#confirmYesBtn').click(ifYes);
    $('#confirmModal').modal('show');
}

jt.QueueAppDiv = function(app) {
    var text = app.appId;
    if (Utils.objLength(app.options) > 0) {
        text += '(';
    }
    for (var i in app.options) {
        text += i + '=' + app.options[i] + ', ';
    }
    if (Utils.objLength(app.options) > 0) {
        text = text.substring(0, text.length - 2);
        text += ')';
    }
    return $('<div style="white-space: normal; word-break: break-all">').text(text);
}

jt.disableButton = function(elId) {
    $('#' + elId).attr('disabled', true);
    $('#' + elId).addClass('disabled');
    $('#' + elId).removeClass('active');
}

jt.enableButton = function(elId) {
    $('#' + elId).attr('disabled', false);
    $('#' + elId).removeClass('disabled');
}

jt.AppOptionRow = function(option, app, options) {
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
            input = $(tagText + ' class="view-app-option form-control" app-option-name="' + option.name + '" id="view-app-option-' + option.name + '">');
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

jt.AppOptionDiv = function(option, selected) {
    var div = $('<div class="form-group option-div">');
    var nameEl = $('<label for="view-app-option-' + option.name + '" class="option-label col-form-label">').text(option.name + ': ');
    div.append(nameEl);
    var tdSel = $('<div class="option-input">');
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
            input = $(tagText + ' class="view-app-option form-control" app-option-name="' + option.name + '" id="view-app-option-' + option.name + '">');
            tdSel.append(input);
            break;
    }
    var descEl = $('<div class="col-form-label">').html(option.description);
    div.append(descEl);
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
                        <div><small style='white-space: normal' class='text-muted'>${app.id}<small></div>
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
                for (let i in app.options) {
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
                optionsEl = $('<td style="display: flex; flex-wrap: wrap; padding-top: calc(.375rem - 1px);">');
                for (let i in app.options) {
                    let option = app.options[i];
                    let selected = undefined;
                    if (app[option.name] !== undefined) {
                        selected = app[option.name];
                    }
                    if (option.defaultVal !== undefined) {
                        selected = option.defaultVal;
                    }
                    if (options !== undefined && options[option.name] !== undefined) {
                        selected = options[option.name];
                    }
                    let div = jt.AppOptionDiv(option, selected);
                    optionsEl.append(div);
                }
                row.append(optionsEl);
                break;
            }
        }

    } catch (err) {
        console.log('error in view');
    }

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

    } catch (err) {
        console.log('error in view');
    }

    return row;
}

// DRAG-DROP UI
jt.CardPanel = function(id, title, contentEl) {
    var cardBlock = $('<div class="card-block panel-content">');
    cardBlock.append(contentEl);
    var card = new this.Panel(id, title, cardBlock);
    return card;
}

jt.addCardPanel = function(id, title, contentEl) {
    var panel = new jt.CardPanel(id, title, contentEl);
    panel.attr('hidden', true);
    $('body').append(panel);
    return panel;
}

jt.addPanel = function(id, title, contentEl) {
    var panel = new this.Panel(id, title, contentEl);
    panel.attr('hidden', true);
    $('body').append(panel);
    return panel;
}

jt.showPanel = function(t) {
    var el = $(t.replace(/\./g, '\\.'));
    el.removeAttr('hidden');
}

jt.Panel = function(id, title, contentEl) {
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
            for (let j in queue.apps) {
                var app = queue.apps[j];
                var div = this.QueueAppDiv(app);
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

jt.CustomAppFolder = function(folder) {
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
        .click(fol, this.removeCustomAppFolder)
        .text("remove")
        .addClass('btn')
        .addClass('btn-sm')
        .addClass('btn-secondary')
        .attr('href', '#')
        .attr('role', 'button');
    actions.append(removeBtn);
    return div;
}

jt.showPlayerCurApp = function(participant) {
    var appText = participant.appIndex + '-';
    if (participant.appIndex < 1 || participant.appIndex > jt.data.session.apps.length) {
        return;
    } else {
        var app = jt.data.session.apps[participant.appIndex-1];
        appText = appText + app.shortId;
    }
    $('#app-' + this.safePId(participant.id)).text(appText);
//    $('.participant-' + participant.id + '-appIndex').text(participant.appIndex);
}

// jt.openClient(event) {
//     // TODO
// }

jt.showAppFolders = function(folders) {
    $('#custom-app-folders').empty();
    for (var i in folders) {
        var folder = folders[i];
        jt.showCustomAppFolder(folder);
    }
}

jt.showCustomAppFolder = function(folder) {
    var folderRow = new jt.CustomAppFolder(folder);
    $('#custom-app-folders').append(folderRow);
}

jt.addAppToNewSessionQueue = function(id) {
    var div = $('<span class="view-apps-queue-app">').text(id);
    $('#view-apps-queue').append(div);
}

jt.showSessionAppName = function(an) {
    $('#sessionAppName').text(an);
}

jt.showPId = function(id) {
    $('#jt-admin-menu-login').text(id);
}