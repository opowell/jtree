jt.gotoNextStage = function() {
    var msg = {};
    msg.pId = data.player.participant.id;
    msg.stageId = data.player.stage.id;
    msg.periodId = data.player.group.period.id;
    socket.emit('goto-next-stage', msg);
}

// https://stackoverflow.com/questions/1303646/check-whether-variable-is-number-or-string-in-javascript
jt.isNumber = function(o) {
  return ! isNaN (o-0) && o !== null && o !== "" && o !== false;
}

jt.formatValue = function(el, num) {
    var dec = $(el).attr('jt-decimals');
    if (dec !== undefined && jt.isNumber(num)) {
        num = jt.round(num-0, dec);
    }
    return num;
}

// https://stackoverflow.com/questions/1726630/formatting-a-number-with-exactly-two-decimals-in-javascript
jt.round = function(value, exp) {
  if (typeof exp === 'undefined' || +exp === 0)
    return Math.round(value);

  value = +value;
  exp = +exp;

  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0))
    return NaN;

  // Shift
  value = value.toString().split('e');
  value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp)));

  // Shift back
  value = value.toString().split('e');
  return +(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp));
}

jt.evaluateDisplayConditions = function(player) {
    let group = player.group;
    let period = group.period;
    let app = period.app;
    let session = app.session;
    let stage = player.stage;
    let participant = player.participant;
    let clock = jt.getClock(jt.data.timeLeft);
    let valEls = $('[jt-displayIf]');
    for (let i=0; i<valEls.length; i++) {
        try {
            let el = $(valEls[i]);
            let val = eval(el.attr('jt-displayIf'));
            if (val === true) {
                el.show();
            } else {
                el.hide();
            }
        } catch (err) {

        }
    }

}

jt.specialAttrNames = [
    'jt-status',
    'jt-stage',
    'jt-displayif',
    'jt-enabledif',
    'jt-decimals',
    'jt-table',
    'jt-show',
    'jt-sortasc',
    'jt-sortdesc',
    'jt-filter',
    'jt-select',
    'jt-action'
]

jt.parseText = function() {

    if (jt.textParsed) {
        return;
    }

    jt.textParsed = true;

    $.fn.ignoreChildren = function(){
      return this.clone().children().remove().end();
    };

    var markerStart = jt.data.player.group.period.app.textMarkerBegin;
    var markerEnd = jt.data.player.group.period.app.textMarkerEnd;

    // For body elements.
    var els = $('body').find('*');
    for (var i=0; i<els.length; i++) {
        var el = els[i];
        // If a clone of the element, excluding children, contains "{...}".
        var matchedEl = $(el).ignoreChildren().filter(':contains("' + markerStart + '")');
        if (matchedEl.length > 0) {
            matchedEl = matchedEl[0];
            // Rewrite the inner HTML of the element.
            var html = matchedEl.innerHTML;
            while (html.indexOf(markerStart) > -1) {
                var ind1 = html.indexOf(markerStart);
                var ind2 = html.indexOf(markerEnd);
                var text = html.substring(ind1+markerStart.length, ind2);
                var span = $('<span jt-text="' + text + '">');
                html = html.replace(markerStart + text + markerEnd, span[0].outerHTML);
            }
            matchedEl.innerHTML = html;

            // Add the children to the clone.
            while ($(el).children().length > 0) {
                $(matchedEl).append($(el).children()[0]);
            }

            // Replace the original element with the clone.
            $(el).replaceWith(matchedEl);
        }
    }
}

jt.setValues = function(player) {
    let group = player.group;
    let period = group.period;
    let app = period.app;
    let session = app.session;
    let stage = player.stage;
    let participant = player.participant;
    let clock = jt.getClock(jt.data.timeLeft);

    $('*').each(function(index) {
        let atts = this.attributes;
        for (var i=0; i<atts.length; i++){
            var att = atts[i];
            if (att.name.startsWith('jt-')) {
                if (att.name === 'jt-html') {
                    let val = eval(att.value);
                    val = jt.formatValue(this, val);
                    this.innerHTML = val;
                } else if (att.name === 'jt-text') {
                    let val = eval(att.value);
                    val = jt.formatValue(this, val);
                    $(this).text(val);
                } else if (
                    jt.specialAttrNames.includes(att.name)
                ) {
                    // DO NOTHING
                } else {
                    try {
                        let val = eval(att.value);
                        var attrName = att.name.substring('jt-'.length);
                        var stepSize = $(this).attr('step');
                        if (stepSize != null) {
                            switch (attrName) {
                            case 'max':
                                val = Math.floor(val/stepSize)*stepSize;
                                break;
                            case 'min':
                                val = Math.ceil(val/stepSize)*stepSize;
                                break;
                            }
                        }
                        this.setAttribute(attrName, val);
                    } catch (err) {
                        console.log('ERROR in defaultClient.js: \n' + err);
                    }
                }
            }
        }
    });

}

jt.textParsed = false;

// Default client functionality to be included in all (most?) apps.
jt.defaultConnected = function() {

    jt.setPlayerStatus('waiting');

    // Listen for default messages from server.
    jt.socket.on('start-new-app', function(id) {
        location.reload();
    });

    // Listen for default messages from server.
    jt.socket.on('reload', function(id) {
        location.reload();
    });

    jt.socket.on('playerUpdate', function(player) {
        console.log('player update: ' + JSON.stringify(player));
        if (jt.data.player !== undefined && player.participant.id !== jt.data.player.participant.id) {
            return;
        }
        jt.data.player = player; // TODO: Remove.
//        window.player = player;

        // Re-establish object links.
        player.participant.session = player.group.period.app.session;
        if (player.stage !== undefined) {
            player.stage.app = player.group.period.app;
        }

        jt.parseText();
        jt.setValues(player);
        jt.evaluateDisplayConditions(player);
        jt.setPlayerStatus(player.status);
        if (player.stage !== undefined) {
            jt.setStageName(player.stage.id);
        }
        if (player.stageTimerTimeLeft > 0) {
            var endTime = new Date(player.stageTimerStart).getTime() + player.stageTimerTimeLeft;
            jt.startClock(endTime);
        } else {
            jt.setStageHasTimeout(false);
        }

        // Group tables
        for (var i=0; i<player.group.tables.length; i++) {

            var tableName = player.group.tables[i];

            // Listen for tableAdd methods.
            if (jt.socket._callbacks['$' + tableName + 'Add'] === undefined) {
                jt.socket.on(tableName + 'Add', function(data) {
                    eval('jt.' + tableName + 'Add')(data);
                });
            }

            // Listen for tableRemove methods.
            if (jt.socket._callbacks['$' + tableName + 'Remove'] === undefined) {
                jt.socket.on(tableName + 'Remove', function(id) {
                    eval('jt.' + tableName + 'Remove')(id);
                });
            }

            if (jt.socket._callbacks['$' + tableName + 'Update'] === undefined) {
                jt.socket.on(tableName + 'Update', function(id) {
                    eval('jt.' + tableName + 'Update')(id);
                });
            }

            var tableEls = $('*[jt-table="' + tableName + '"]');
            for (var j=0; j<tableEls.length; j++) {
                var tableEl = tableEls[j];
                var selectName = $(tableEl).attr('id');

                // Refresh button status
                jt.refreshButtons(selectName);

                // Clear select
                $(tableEl).html('');

                // Set button actions.
                var buttons = $('*[jt-select=' + selectName + ']');
                for (var b=0; b<buttons.length; b++) {
                    var clickFN = function(event) {
                        var but = $(event.target);
                        var action = but.attr('jt-action');
                        var selectName = but.attr('jt-select');
                        var tableEl = $('#' + selectName);
                        var rowId = $(tableEl).val();
                        console.log(jt.data.player.id + ', ' + action + ', ' + rowId);
                        jt.sendMessage(action, rowId);
                    };
                    var but = $(buttons[b]);

                    // Clear previous click function, if any.
                    but.off('click');

                    // Add click function.
                    but.click(clickFN);
                }
            }

            // Called automatically when row is added to server.
            // Add row to data object, then add to display.
            if (jt[tableName + 'Add'] === undefined) {
                jt[tableName + 'Add'] = function(newRow) {
                    jt.data.player.group[tableName].push(newRow);
                    eval('jt.' + tableName + 'Show')(newRow);
                }
            }

            if (jt[tableName + 'Update'] === undefined) {
                jt[tableName + 'Update'] = function(row) {
                    eval('jt.' + tableName + 'Remove')(row.id);
                    eval('jt.' + tableName + 'Add')(row);
                }
            }

            if (jt[tableName + 'Remove'] === undefined) {
                jt[tableName + 'Remove'] = function(id) {
                    var table = jt.data.player.group[tableName];
                    for (var i=0; i<table.length; i++) {
                        var row = table[i];
                        if (row.id === id) {
                            // https://www.w3schools.com/js/js_array_methods.asp
                            table.splice(i, 1);
                            break;
                        }
                    }

                    // Remove all HTML elements for this row.
                    $('.group-' + tableName + '-' + id).remove();

                    // Refresh buttons
                    var tableEls = $('*[jt-table="' + tableName + '"]');
                    for (var j=0; j<tableEls.length; j++) {
                        var tableEl = tableEls[j];
                        var selectName = $(tableEl).attr('id');
                        jt.refreshButtons(selectName);
                    }
                    eval(tableName + 'Remove')(id);
                }
            }

            // Added row to display.
            if (jt[tableName + 'Show'] === undefined) {
                jt[tableName + 'Show'] = function(row) {
                    var tableEls = $('*[jt-table="' + tableName + '"]');
                    for (var j=0; j<tableEls.length; j++) {
                        var tableEl = $(tableEls[j]);
                        var fieldToShow = tableEl.attr('jt-show');
                        var filter = 'true';
                        if (tableEl.attr('jt-filter') !== undefined) {
                            filter = tableEl.attr('jt-filter');
                        }
                        var selectName = tableEl.attr('id');
                        if (eval(filter)) {
                            var rowEl = $('<option>');
                            var value = jt.formatValue(tableEl, row[fieldToShow]);
                            rowEl.text(value);
                            rowEl.val(row.id);
                            rowEl.addClass('group-' + tableName + '-' + row.id);
                            rowEl.data(row);
                            if (row.makerPId === jt.data.player.id) {
                                rowEl.css('color', 'blue');
                            }
                            var sortAsc = tableEl.attr('jt-sortasc');
                            var sortDesc = tableEl.attr('jt-sortdesc');
                            var added = false;
                            if (sortAsc !== undefined) {
                                var children = tableEl.children();
                                var rowVal = row[sortAsc];
                                for (var i=0; i<children.length; i++) {
                                    var child = $(children[i]);
                                    var childVal = child.data(sortAsc);
                                    if (!isNaN(rowVal)) {
                                        childVal = parseFloat(childVal);
                                    }
                                    if (childVal < rowVal) {
                                        rowEl.insertBefore(child);
                                        added = true;
                                        break;
                                    }
                                }
                            } else if (sortDesc !== undefined) {
                                var children = tableEl.children();
                                var rowVal = row[sortDesc];
                                for (var i=0; i<children.length; i++) {
                                    var child = $(children[i]);
                                    var childVal = child.data(sortDesc);
                                    if (!isNaN(rowVal)) {
                                        childVal = parseFloat(childVal);
                                    }
                                    if (childVal > rowVal) {
                                        rowEl.insertBefore(child);
                                        added = true;
                                        break;
                                    }
                                }
                            }
                            if (!added) {
                                tableEl.append(rowEl);
                            }
                            rowEl.click({selectName: selectName}, function(event) {
                                jt.refreshButtons(event.data.selectName);
                            });
                        }
                    }
                }
            }

            var tableRows = player.group[tableName];
            for (var j=0; j<tableRows.length; j++) {
                var row = tableRows[j];
                eval('jt.' + tableName + 'Show')(row);
            }
        }
    });

    jt.socket.on('logged-in', function(id){
        $('#player').text(id);
        console.log('logged-in');
    });

    jt.socket.on('set-clock-timeleft', function(val) {
        console.log('set-clock-timeleft: ' + val);
        jt.data.timeLeft = val;
        jt.displayTime();
    });

    jt.socket.on('set-stage', function(content) {
        console.log('set-stage: ' + content);
        $('#jt-main').html(content);
    });

    jt.socket.on('clock-start', function(endTime) {
        jt.startClock(endTime);
    });

    jt.socket.on('endStage', function(player) {
        if (
            jt.data.player.id === player.id &&
            jt.data.player.group.period.id === player.group.period.id &&
            jt.data.player.stage.id === player.stage.id
        )
        var forms2 = $('form').filter(':visible');
        if (forms2 != null && forms2.length > 0) {
            forms2.each(function() {
                $(this).submit();
            });
        } else {
            var values = {};
            var stageName = jt.data.player.stage.id;
            values.fnName = stageName;
            jt.sendMessage(stageName, values);
        }
    });

    jt.socket.on('clock-stop', function(timeLeft) {
        jt.clockStop(timeLeft);
    });

    jt.socket.on('set-stage-name', function(name) {
        jt.setStageName(name);
    });

    jt.socket.on('set-player-status', function(data) {
        console.log('direct');
        jt.setPlayerStatus(data);
    });

    jt.socket.on('setAutoplay', function(d) {
        if (jt.data.player !== undefined && d.participantId === jt.data.player.id) {
            jt.setAutoplay(d.val);
        }
    });

    jt.socket.on('setAutoplayDelay', function(d) {
        if (jt.data.player !== undefined && d.participantId === jt.data.player.id) {
            jt.setAutoplayDelay(d.val);
        }
    });

    // Set up automated form submission for stages.
    $('form').each(function() {
        // If it only contains a single button, make this the submit button.
        let buttons = $(this).find('button');
        if (buttons.length === 1) {
            let but = $(buttons[0]);
            if (but.attr('type')===undefined) {
                but.attr('type', 'submit');
            }
        }

        // For submit buttons, add their value as hidden inputs to the form when they are clicked.
        // See, for example, Centipede game.
        var form = $(this);
        for (let i=0; i<buttons.length; i++) {
            let but = $(buttons[i]);
            if (but.attr('type')==='submit') {
                form.find('[jt-autoGenerated=true]').remove();
                but.click(function(e) {
                    if (this.name !== '') {
                        form.append($('<input jt-autoGenerated=true type="hidden" name="' + this.name + '" value="' + this.value + '">'))
                    }
                });
            }
        }

        if ($(this).attr('action')===undefined) {
            try {
//                var stageEl = $(this).closest('[jt-stage]')[0];
                // var stageName = $(stageEl).attr('jt-stage');
                $(this).submit(function(event) {

                    var values = {};
                    var stageName = jt.data.player.stage.id;
                    values.fnName = stageName;

                    // INPUTS (includes input, select and checkboxes, but not buttons)
                    // https://stackoverflow.com/questions/11855781/jquery-getting-data-from-form
                    var $inputs = $(this).find(':input:not(:button)');
                    $inputs.each(function() {
                        // Skip blank inputs.
                        var fieldName = $(this).attr('name');
                        if (fieldName !== '' && fieldName !== undefined) {
                            if (this.type === 'checkbox') {
                                if (this.checked === true) {
                                    if (values[fieldName] === undefined) {
                                        values[fieldName] = [];
                                    }
                                    values[fieldName].push(this.value);
                                }
                            } else if (this.type === 'radio') {
                                    values[fieldName] = this.value;
                            } else {
                                values[fieldName] = this.value;
                            }
                        }
                    });

                    jt.sendMessage(stageName, values);
                    event.preventDefault();
                });
            } catch (err) {

            }
        }
    });

}

jt.refreshButtons = function(elName) {

    if (elName == null) {
        return false;
    }

    let player = jt.data.player;
    let group = player.group;
    let period = group.period;
    let app = period.app;
    let session = app.session;
    let stage = player.stage;
    let clock = jt.getClock(jt.data.timeLeft);

    var selRow = null;
    var el = $('#' + elName);
    var selId = el.val();
    var tableName = el.attr('jt-table');
    var rows = group[tableName];
    for (var i=0; i<rows.length; i++) {
        if (rows[i].id + '' === selId) {
            selRow = rows[i];
            break;
        }
    }
    var buttons = $('*[jt-select=' + elName + ']');
    for (var b=0; b<buttons.length; b++) {
        var but = $(buttons[b]);
        var enabled = true;
        if (but.attr('jt-enabledIf') !== undefined) {
            enabled = eval(but.attr('jt-enabledIf'));
        }
        jt.setButtonEnabled(but, enabled);
    }
}

jt.setButtonEnabled = function(but, enabled) {
    but.prop("disabled",!enabled);
    if (enabled) {
        but.removeClass('disabled');
    } else {
        but.addClass('disabled');
    }
}

jt.setStageName = function(name) {
    console.log('set-stage-name: ' + name);

    $('body').css('display', 'none');

    document.title = name;
    $('[jt-stage]').each(function () {
        $(this).removeClass('stage-active');
        if (jt.alwaysShowAllStages) {
            this.removeAttribute('hidden');
        } else {
            this.setAttribute('hidden', true);
        }
    });

    $('body').css('display', 'block');

    $('[jt-stage="' + name + '"]').each(function () {
        this.removeAttribute('hidden');
        $(this).addClass('stage-active');
        // Clear inputs
        $(this).find(':input')
        .removeAttr('checked')
        .removeAttr('selected')
        .not(':button, :submit, :reset, :hidden, :radio, :checkbox')
        .val('');
    });

}

jt.setPlayerStatus = function(newStatus) {
    console.log('set-player-status: ' + newStatus);
    $('[jt-status]').each(function () {
        let attr = $(this).attr('jt-status');
        if (attr === newStatus ||
            (attr === 'waiting' && (newStatus === 'ready' || newStatus === 'finished' || newStatus === 'done')) ||
            (attr === 'active' && newStatus === 'playing')
        ) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}

jt.setStageHasTimeout = function(b) {
    console.log('setStageHasTimeout: ' + b);
    if (b) {
        $('#time-remaining-div').removeAttr('hidden');
    } else {
        $('#time-remaining-div').attr('hidden', true);
    }
}

jt.clockStop = function(timeLeft) {
    console.log('clock-stop');
    jt.data.timeLeft = timeLeft;
    clearInterval(jt.timer);
    jt.data.clockRunning = false;
    jt.updateClock();
}

jt.startClock = function(endTime) {
    console.log('clock-start');
    jt.setStageHasTimeout(true);
    jt.data.endTime = endTime;
    jt.data.clockRunning = false;
    if (jt.data.player.stageTimerRunning) {
        jt.data.timeLeft = jt.data.endTime - Date.now();
    } else {
        jt.data.timeLeft = jt.data.player.stageTimerTimeLeft;
    }
    jt.updateClock(); // update once without starting
    jt.data.clockRunning = jt.data.player.stageTimerRunning;
    var now = Date.now();
    var diff = jt.data.endTime - now;
    console.log('Time left: ' + diff);
    if (jt.data.endTime > now && jt.data.clockRunning) {
        jt.timer = setInterval(jt.updateClock, jt.data.CLOCK_FREQUENCY);
    }
}

jt.updateClock = function() {
    if (jt.data.clockRunning) {
        var now = Date.now();
        jt.data.timeLeft = jt.data.endTime - now;
        if (jt.data.timeLeft <= 0) {
            // TODO: request update from server
            //server.refresh();
        } else {
            if (jt.timer === null) {
                jt.startClock();
            }
        }
    } else {
        clearInterval(jt.timer);
    }
    jt.displayTime();
}

jt.displayTime = function() {
    jt.displayTimeLeft($('[jt-text="clock.minutes"]'), $('[jt-text="clock.seconds"]'), jt.data.timeLeft);
}

jt.sendMessage = function(msgName, msgData) {
    var metaData = {player: jt.data.player, data: msgData};
    jt.socket.emit(msgName, metaData);
}

jt.showAllStages = function() {
    $('.jt-stage').each(function () {
        this.classList.removeAttribute('hidden');
    });
}

jt.showStage = function(s) {
    var el = $('#' + s);
    el.removeAttribute('hidden');
    document.title = s;
}


/**
 * First, attempts to set the value of an input that currently has no value.
 * If no such value is found, it "clicks" a random submit button.
 *
 * Overwrite this function to implement custom autoplay functionality.
 *
 */
jt.autoplay = function() {
    var acted = false;
    //var inputs = $('input:visible:not([disabled])');
    var inputs = $('input,textarea,select').filter(':visible:not([disabled])');
    for (var i=0; i<inputs.length; i++) {
        if (acted) {
            console.log('acted!');
            return false;
        }
        var input = $(inputs[i]);
        const tagName = input[0].tagName;
        // if (input.val() === '' && input.attr('required') !== undefined) {
        if (tagName === 'INPUT') {
            var inputType = input.attr('type');
            if (inputType === 'number') {
                if (input.val() === '') {
                    var min = input.attr('min')-0;
                    if (input.attr('min') === undefined) {
                        min = 0;
                    }
                    var max = input.attr('max')-0;
                    if (input.attr('max') === undefined) {
                        max = 1000;
                    }
                    var step = input.attr('step')-0;
                    if (input.attr('step') === undefined) {
                        step = 1;
                    }
                    var val = Math.round(Math.random()*(max - min)/step)*step + min;
                    input.val(val);
                    acted = true;
                }
            } else if (inputType === 'text') {
                if (input.val() === '') {
                    input.val(jt.data.player.id + ' - some text');
                    acted = true;
                }
            } else if (inputType === 'email') {
                if (input.val() === '') {
                    input.val(jt.data.player.id + '-example@abc.com');
                    acted = true;
                }
            }
            else if (inputType === 'radio') {
                // If no radio button from this group is currently selected, select a random radio button.
                let hasSelection = false;
                const name = $(input[0]).prop('name');
                var radios = $('[name="' + name + '"]');
                for (let i=0; i<radios.length; i++) {
                    let radio = $(radios[i]);
                    if (radio.prop('checked')) {
                        hasSelection = true;
                        break;
                    }
                }
                if (!hasSelection) {
                    const index = Math.round(Math.random()*(radios.length-1));
                    $(radios[index]).prop('checked', true);
                    acted = true;
                }
            } else if (inputType === 'checkbox') {
                if ($(input[0]).attr('scanned') === undefined) {
                    const name = $(input[0]).prop('name');
                    var checkboxes = $('[name="' + name + '"]');
                    for (let i=0; i<checkboxes.length; i++) {
                        let cb = $(checkboxes[i]);
                        if (Math.random() < 0.5) {
                            cb.prop('checked', true);
                        }
                        cb.attr('scanned', true);
                    }
                    acted = true;
                }
            } else if (inputType === 'range') {
                if (input.attr('scanned') === undefined) {
                    var min = input.attr('min')-0;
                    var max = input.attr('max')-0;
                    var step = input.attr('step')-0;
                    var val = Math.round(Math.random()*(max - min)/step)*step + min;
                    input.val(val);
                    input.trigger('change');
                    input.attr('scanned', true);
                    acted = true;
                }
            } else if (inputType === '') {
                if (input.val() === '') {
                    input.val(jt.data.player.id + ' - some text');
                    acted = true;
                }
            }
        } else if (tagName === 'TEXTAREA') {
            if (input.val() === '') {
                input.val(jt.data.player.id + ' - some long text');
                acted = true;
            }
        } else if (tagName === 'SELECT') {
            if (input.val() === null) {
                const index = Math.round(Math.random()*(input[0].options.length-1));
                if (input[0].options[index] !== undefined) {
                    input.val(input[0].options[index].value);
                    acted = true;
                }
            }
        }
    }
    if (!acted) {
        // CLICK RANDOM SUBMIT BUTTON
        var buttons = $('button:visible:not([disabled])');
        if (buttons.length > 0) {
            var button = randomEl(buttons);
            button.click();
        }
    }

}

jt.autoplayWrapper = function() {
    if (jt.autoplayOn) {
        jt.autoplay();
        setTimeout(jt.autoplayWrapper, eval(jt.autoplayDelay));
    }
}

jt.autoplayOn = false;
jt.autoplayDelay = 2000;

jt.setAutoplayDelay = function(delay) {
    jt.autoplayDelay = delay;
    jt.popupMessage('Setting autoplay delay to <b>' + delay + '</b>.');
}

jt.toggleAutoplay = function() {
    jt.setAutoplay(!jt.autoplayOn);
}

jt.setAutoplay = function(b) {

    jt.autoplayOn = b;

    if (b) {
        setTimeout(jt.autoplayWrapper, eval(jt.autoplayDelay));
    }
    jt.popupMessage('Setting autoplay to <b>' + b + '</b>.');
}

jt.popupMessage = function(text) {
    var abDiv = $('<div class="popup">');
    var div = $('<div class="alert-box success">');
    div.html(text);
    abDiv.append(div);
    $('body').append(abDiv);
    abDiv.delay(1200).fadeOut(700);
}
