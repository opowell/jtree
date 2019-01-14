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

jt.likertScale = function(field) {
    var el = $('#' + field);
    var minText = el.attr('likert-low');
    var maxText = el.attr('likert-high');

    var minTextEl = $('<div class="likertMinText likertText">').html(minText);
    var maxTextEl = $('<div class="likertMaxText likertText">').html(maxText);

    el.append(minTextEl);
    for (var i=1; i<=7; i++) {
        var option = $('<label for="' + field + i + '" class="likertScaleOption answer">');
        var input = $("<input name='player." + field + "' type='radio' required value='" + i + "' id='" + field + i + "'>");
        var label = $("<div>").text(i);
        option.append(label);
        option.append(input);
        el.append(option);
    }
    el.append(maxTextEl);
}

jt.setFormDefaults = function() {
 //   return;
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
                $(this).submit(function(event) {
                    event.preventDefault();
                    event.stopPropagation();
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
                                if (this.checked) {
                                    values[fieldName] = this.value;
                                }
                            } else {
                                values[fieldName] = this.value;
                            }
                        }
                    });

                    jt.sendMessage(stageName, values);
                });
            } catch (err) {
                console.log('error assigning submit button action');
                console.log(JSON.stringify(err));
            }
        }
    });

}

// Disable navigation away from the page, unless password is entered.
// Do not disable if page is in iFrame (i.e. being viewed from the admin page).
jt.inIframe = function() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

// Setting to indicate whether server has asked for client to reload.
jt.forcedUnload = false;

window.onbeforeunload = function(ev) {
    if (!jt.inIframe() && !jt.forcedUnload) {
        return 'Want to unload?';
    }
};

jt.vueMounted = false;
jt.vueMethods = {};

jt.mountVue = function(player) {
    if (player.stage.app.useVue) {
    
        let vueComputed = {
            clock: function() {
                return jt.getClock(this.timeLeft);
            },
            clockClient: function() {
                return jt.getClock(this.timeLeftClient);
            },
            groupOtherPlayers: function() {
                let players = [];
                let me = this.player;
                if (this.group.players != null && this.group.players.length > 0) {
                    players = this.group.players.filter(function (grpPlyr) {
                        return grpPlyr.id !== me.id;
                    })
                }
                return players;
            }
        };
        let computed = player.stage.app.vueComputedText;
        for (let i in computed) {
            eval('vueComputed[i] = ' + computed[i]);
        }
        let methods = player.stage.app.vueMethodsText;
        for (let i in methods) {
            eval('vueMethods[i] = ' + methods[i]);
        }
    
        let vueModel = jt.getVueModels(player);

        jt.vue = new Vue({
            el: '#jtree',
            data: vueModel,
            computed: vueComputed,
            methods: jt.vueMethods,
            mounted: function() {
                jt.setFormDefaults();
                jt.setValues();
            }
        });
    } else {
        jt.vue = {};
        jt.setFormDefaults();
        jt.setValues();
    }

    jt.vueMounted = true;
    jt.updatePlayer(player, false);

}

jt.getVueModels = function(player) {
    let vueModel = {
        jt: jt,
        player: player,
        group: player.group,
        period: player.group.period,
        stage: player.stage,
        app: player.stage.app,
        participant: player.participant,
        timeLeft: 0,
        timeLeftClient: 0,
        hasTimeout: false,
        hasTimeoutClient: false,
        timeElapsed: 0,
        timeElapsedClient: 0,
    }
    if (vueModel.group.players == null) {
        vueModel.group.players = [];
    }
    let models = player.stage.app.vueModels;
    for (let i in models) {
        if (vueModel[i] == null) {
            vueModel[i] = models[i];
        }
    }
    if (models.participant != null) {
        for (let i in models.participant) {
            if (vueModel.participant[i] == null) {
                vueModel.participant[i] = models.participant[i];
            }
        }
    }

    // Scan page for vue models, add if not already present.
    let vueModelEls = $('[v-model]');
    for (let i=0; i<vueModelEls.length; i++) {
        let varName = vueModelEls[i].getAttribute('v-model');
        if (vueModel[varName] == null) {
            vueModel[varName] = '';
        }
    }

    let page = document.documentElement.innerHTML;
    let index = page.indexOf('@input=');
    while (index > -1) {
        let end = page.indexOf("=", index + '@input='.length);
        let varName = page.substring(index + '@input='.length + 1, end).trim();
        if (vueModel[varName] == null) {
            vueModel[varName] = '';
        }
        index = page.indexOf('@input=', end);
    }

    return vueModel;
}

jt.setValues = function(player) {
    if (player == null) {
        player = jt.data.player;
    }
    let clock = jt.getClock(jt.data.timeLeft);

    $('*').each(function(index) {
        let atts = this.attributes;
        for (var i=0; i<atts.length; i++){
            var att = atts[i];
            if (att.name.startsWith('jt-')) {
                if (att.name === 'jt-html') {
                    let val = jt.eval(att.value, player, clock);
                    val = jt.formatValue(this, val);
                    this.innerHTML = val;
                } else if (att.name === 'jt-text') {
                    let val = jt.eval(att.value, player, clock);
                    val = jt.formatValue(this, val);
                    $(this).text(val);
                // } else if (
                //     jt.specialAttrNames.includes(att.name)
                // ) {
                    // DO NOTHING
                } else {
                    try {
                        let val = jt.eval(att.value, player, clock);
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

jt.updatePlayer = function(player, updateVue) {
    // console.log('player update: ' + JSON.stringify(player));
    if (jt.data.player !== undefined && player.participant.id !== jt.data.player.participant.id) {
        return;
    }

    console.log('playerUpdate');

    // Re-establish object links.
    player.participant.session = player.group.period.app.session;
    if (player.stage !== undefined) {
        player.stage.app = player.group.period.app;
    }

    jt.data.player = player; // TODO: Remove.

    if (!jt.vueMounted) {
        jt.mountVue(player);
        $('body').addClass('show');
        return;
    } else {
        if (updateVue) {
            let models = jt.getVueModels(player);
            jt.vue.player = models.player;
            jt.vue.group = models.group;
            jt.vue.period = models.period;
            jt.vue.stage = models.stage;
            jt.vue.app = models.app;
            jt.vue.participant = models.participant;
            jt.vue.timeElapsed = 0;
            jt.setValues(player);
        }
    }

    window.scrollTo(0, 0);

    if (player.stage !== undefined) {
        jt.setStageName(player.stage.id);
    }
    if (player.stageTimerTimeLeft > 0) {
        // Must use timer duration. Cannot use server start time, since no guarantee that client time is the same.
        var endTime = new Date().getTime() + player.stageTimerTimeLeft;
        jt.startClock(endTime);
    } else {
        jt.vue.hasTimeout = false;
    }

    if (player.stageClientDuration > 0 && player.status == 'playing') {
        var endTime = new Date().getTime() + player.stageClientDuration*1000;
        jt.startClockClient(endTime);
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

        // Called automatically when row is added to server.
        // Add row to data object.
        if (jt[tableName + 'Add'] === undefined) {
            jt[tableName + 'Add'] = function(newRow) {
                jt.data.player.group[tableName].push(newRow);
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
                        table.splice(i, 1);
                        break;
                    }
                }
            }
        }
    }

    jt.postUpdatePlayer();

}

jt.postUpdatePlayer = function() {}

// Default client functionality to be included in all (most?) apps.
jt.defaultConnected = function() {

    if ($('#jtree').length > 0) {
        // https://gist.github.com/belsrc/672b75d1f89a9a5c192c
        Vue.filter('round', function(value, decimals) {
            if (!value) {
                value = 0;
            }
            if (!decimals) {
                decimals = 0;
            }
            value = Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
            return value;
        });

    }
    
    jt.setFormDefaults();
    
    // jt.setPlayerStatus('waiting');

    // Listen for default messages from server.
    jt.socket.on('start-new-app', function(id) {
        jt.forcedUnload = true;
        location.reload();
    });

    // Listen for default messages from server.
    jt.socket.on('reload', function(id) {
        jt.forcedUnload = true;
        location.reload();
    });

    jt.socket.on('playerUpdate', function(player) {
        jt.updatePlayer(player, true);
    });

    jt.socket.on('logged-in', function(id){
        $('#player').text(id);
        console.log('logged-in as ' + id);
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
        jt.endStage(player);
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

    jt.connected();

}

jt.connected = function() {}

jt.endStage = function(player) {
    if (player == null) {
        player = jt.data.player;
    }
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
}

jt.setStageName = function(name) {
    document.title = name;
    $('body').find(':input')
        .removeAttr('checked')
        .removeAttr('selected')
        .not(':button, :submit, :reset, :hidden, :radio, :checkbox')
        .val('');
    $('body').removeClass('hidden');
}

jt.clockStop = function(timeLeft) {
    console.log('clock-stop');
    jt.data.timeLeft = timeLeft;
    clearInterval(jt.timer);
    jt.data.clockRunning = false;
    jt.updateClock();
}

jt.startClockClient = function(endTime) {
    jt.vue.hasTimeoutClient = true;

    console.log('clock-start(client) until ' + endTime);

    // Cancel update of UI.
    clearInterval(jt.timerClient);

    jt.data.endTimeClient = endTime;
    jt.data.clockRunningClient = false;

    jt.data.startTimeClient = Date.now();
    if (jt.data.player.stageClientDuration > 0) {
        jt.data.timeLeftClient = jt.data.endTimeClient - jt.data.startTimeClient;
    }

    jt.vue.timeLeftClient = jt.data.timeLeftClient;

    jt.updateClockClient(); // update once without starting

    jt.data.clockRunningClient = true;

    var now = Date.now();
    var timeLeft = jt.data.endTimeClient - now;
    console.log('Time left: ' + timeLeft);
    // If there is time left on the clock, set refresh interval.
    if (timeLeft > 0 && jt.data.clockRunningClient) {
        jt.timerClient = setInterval(jt.updateClockClient, jt.data.CLOCK_FREQUENCY);
    }
    // Otherwise, do not set refresh interval.
    else {
        // If there was a client duration, end stage.
        if (jt.data.player.stageClientDuration > 0) {
            jt.endStage(jt.data.player);
        }
    }

}

jt.startClock = function(endTime) {

    jt.vue.hasTimeout = true;

    console.log('clock-start until ' + endTime);

    // Cancel update of UI.
    clearInterval(jt.timer);

    jt.data.endTime = endTime;
    jt.data.clockRunning = false;

    // If using server-side duration
    jt.data.startTime = Date.now();
    if (jt.data.player.stageTimerRunning) {
        jt.data.timeLeft = jt.data.endTime - jt.data.startTime;
    } else {
        jt.data.timeLeft = jt.data.player.stageTimerTimeLeft;
    }

    jt.vue.timeLeft = jt.data.timeLeft;

    jt.updateClock(); // update once without starting

    jt.data.clockRunning = jt.data.player.stageTimerRunning;
    // If using client-side duration
    if (jt.data.player.stageClientDuration > 0) {
        jt.data.clockRunning = true;
    }

    var now = Date.now();
    var timeLeft = jt.data.endTime - now;
    console.log('Time left: ' + timeLeft);
    // If there is time left on the clock, set refresh interval.
    if (timeLeft > 0 && jt.data.clockRunning) {
        jt.timer = setInterval(jt.updateClock, jt.data.CLOCK_FREQUENCY*5);
    }
    // Otherwise, do not set refresh interval.
    else {
        // If there was a client duration, end stage.
        if (jt.data.player.stageClientDuration > 0) {
            jt.endStage(jt.data.player);
        }
    }
}

jt.updateClockClient = function() {
    if (jt.data.player.stageClientDuration > 0 && jt.data.timeLeftClient <= 0) {
        jt.endStage(jt.data.player);
    }

    if (jt.data.clockRunningClient) {
        var now = Date.now();
        jt.data.timeLeftClient = Math.max(jt.data.endTimeClient - now, 0);
        jt.vue.timeLeftClient = jt.data.timeLeftClient;
        jt.vue.timeElapsedClient = now - jt.data.startTimeClient;
        if (jt.data.timeLeftClient <= 0 && jt.vue.hasTimeoutClient) {
            if (jt.data.player.stageClientDuration > 0) {
                jt.endStage(jt.data.player);
            }
        } else {
            if (jt.timerClient === null) {
                jt.startClockClient();
            }
        }
    }
    // Stage timer finished.
    else {
        // If client duration, end stage.
        if (jt.data.player.stageClientDuration > 0 && jt.data.timeLeftClient < 0) {
            jt.endStage(jt.data.player);
        }
    }
    // jt.displayTime();
    jt.onClockUpdateClient();
}

jt.updateClock = function() {
    if (jt.data.player.stageClientDuration > 0 && jt.data.timeLeft <= 0) {
        jt.endStage(jt.data.player);
    }

    if (jt.data.clockRunning) {
        var now = Date.now();
        jt.data.timeLeft = Math.max(jt.data.endTime - now, 0);
        jt.vue.timeLeft = jt.data.timeLeft;
        jt.vue.timeElapsed = now - jt.data.startTime;
        if (jt.data.timeLeft <= 0 && jt.vue.hasTimeout) {
            if (jt.data.player.stageClientDuration > 0) {
                jt.endStage(jt.data.player);
            }
        } else {
            if (jt.timer === null) {
                jt.startClock();
            }
        }
    }
    jt.onClockUpdate();
}

jt.onClockUpdate = function() {}
jt.onClockUpdateClient = function() {}

// jt.displayTime = function() {
//     jt.displayTimeLeft($('[jt-text="clock.minutes"]'), $('[jt-text="clock.seconds"]'), jt.data.timeLeft);
// }

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


jt.autoplay = function() {
    jt.defaultAutoplay();
}

/**
 * First, attempts to set the value of an input that currently has no value.
 * If no such value is found, it "clicks" a random submit button.
 *
 * Overwrite this function to implement custom autoplay functionality.
 *
 */
jt.defaultAutoplay = function() {
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