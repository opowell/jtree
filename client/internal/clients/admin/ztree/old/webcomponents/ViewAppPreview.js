class ViewAppPreview extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <div id='view-app-preview' style='box-shadow: 0px 0px 11px 2px #888; padding: 15px; display: flex;'>

          <div id='view-app-tree'></div>

          <div hidden class='view-app-screen'>
            <iframe id='view-app-screen'></iframe>
          </div>

      </div>
      `;
    }
}

document.write('<link rel="stylesheet" type="text/css" href="/admin/multiuser/webcomponents/ViewAppPreview.css">');
document.write('<script src="/admin/multiuser/webcomponents/AppSetVariableModal.js"></script>');

jt.updateAppPreview = function(appId) {
    $('#editAppOptionsModal').modal('hide');
    if (appId == null) {
        appId = $('#view-app-id').text();
    }
    var optionEls = $('#editAppOptionsModal').find('[app-option-name]');
    var options = jt.deriveAppOptions(optionEls);
    jt.socket.emit('updateAppPreview', {appId: appId, options: options});
}

jt.showAppPreview = function(app) {
    $('.view-app-screen').resizable();
    jt.showAppTree(app);
    var appMetaData = jt.appMetaData(app.id);
    try {
        var els = $($.parseHTML(appMetaData.clientHTML));
        var stageEls = els.find('[jt-stage]');
        for (var i=0; i<stageEls.length; i++) {
            var stageEl = $(stageEls[i]);
            var id = stageEl.attr('jt-stage');
            var found = false;
            for (var j in app.stages) {
                if (app.stages[j].id === id) {
                    found = true;
                }
            }
            if (!found) {
                stageEl.css('display', 'none');
            }
        }
        var textEls = els.find('[jt-text]');
        for (var i=0; i<textEls.length; i++) {
            var textEl = $(textEls[i]);
            var text = textEl.attr('jt-text');
            try {
                var evalText = eval(text);
                if (evalText !== undefined) {
                    textEl.attr('title', text);
                    text = evalText;
                } else {
                    text = '{' + text + '}';
                }
            } catch (err) {
                text = '{' + text + '}';
            }
            textEl.text(text);
            textEl.css('color', '#004a00');
            textEl.css('background-color', '#c9ecc9');
        }

        var dispIfEls = els.find('[jt-displayIf]');
        for (var i=0; i<dispIfEls.length; i++) {
            var el = $(dispIfEls[i]);
            el.css('background-color', '#ffe9c1');
            el.attr('title', 'Displayed if: ' + el.attr('jt-displayIf'));
        }

        var html = '';
        for (var i=0; i<els.length; i++) {
            var el = $(els[i]);
            if (el.html() !== undefined) {
                html = html + el.html();
            }
        }
        $('#view-app-clientpreview').contents().find('html').html(html);
//        jt.resizeIFrameToFitContent($('#view-app-clientpreview')[0]);
     var optionEls = $('#editAppOptionsModal').find('[app-option-name]');
    var options = jt.deriveAppOptions(optionEls);

        jt.setEditAppOptionsData(app, options, jt.updateAppPreview);
    } catch (err) {
        console.log(err);
    }
}

jt.showStagePreview = function(app, stageId, status, doc) {
    var appMetaData = jt.appMetaData(app.id);
    try {
        var trimmedHTML = $.trim(appMetaData.clientHTML);

        var els = $($.parseHTML(trimmedHTML), doc);
        var statusEls = els.find('[jt-status]').addBack('[jt-status]');
        for (var i=0; i<statusEls.length; i++) {
            var statusEl = $(statusEls[i]);
            var id = statusEl.attr('jt-status');
            // DEPRECATED:
            // change all jt-status tags with 'active', to 'playing'
            if (id === 'active') {
                id = 'playing';
            }

            var found = id === status;
            if (!found) {
                statusEl.css('display', 'none');
            }
        }
        var stageEls = els.find('[jt-stage]').addBack('[jt-stage]');
        for (var i=0; i<stageEls.length; i++) {
            var stageEl = $(stageEls[i]);
            var id = stageEl.attr('jt-stage');
            var found = id === stageId;
            if (!found) {
                stageEl.css('display', 'none');
            }
        }
        var textEls = els.find('[jt-text]').addBack('[jt-text]');
        for (var i=0; i<textEls.length; i++) {
            var textEl = $(textEls[i]);
            var text = textEl.attr('jt-text');
            try {
                var evalText = eval(text);
                if (evalText !== undefined) {
                    textEl.attr('title', text);
                    text = evalText;
                } else {
                    text = '{' + text + '}';
                }
            } catch (err) {
                text = '{' + text + '}';
            }
            textEl.text(text);
            textEl.css('color', '#004a00');
            textEl.css('background-color', '#c9ecc9');
        }

        var dispIfEls = els.find('[jt-displayIf]').addBack('[jt-displayIf]');
        for (var i=0; i<dispIfEls.length; i++) {
            var el = $(dispIfEls[i]);
            var dispCond = el.attr('jt-displayIf');
            try {
                var evalText = eval(dispCond);
                if (evalText !== undefined) {
                    if (!evalText) {
                        el.css('display', 'none');
                    }
                } else {
                    el.css('background-color', '#ffe9c1');
                }
            } catch (err) {
                el.css('background-color', '#ffe9c1');
            }
            el.attr('title', 'Displayed if: ' + dispCond);
        }

        var html = '';
        for (var i=0; i<els.length; i++) {
            var el = $(els[i]);
            if (el.prop('outerHTML') !== undefined) {
                html = html + el.prop('outerHTML');
            }
        }
        return html;
    } catch (err) {
        console.log(err);
        return 'error: ' + err;
    }
}

jt.toggleEl = function(el) {
    var toggleId = el.attr('toggleId');
    if (el.attr('state') === 'open') {
        el.find('.toggleContentOpen[toggleId=' + toggleId + ']').addClass('hidden');
        el.find('.toggleContentClosed[toggleId=' + toggleId + ']').removeClass('hidden');
        el.attr('state', 'closed');
    } else {
        el.find('.toggleContentOpen[toggleId=' + toggleId + ']').removeClass('hidden');
        el.find('.toggleContentClosed[toggleId=' + toggleId + ']').addClass('hidden');
        el.attr('state', 'open');
        var resizableEls = $(el).find('[resizeToggle=' + toggleId + ']');
        for (var i=0; i<resizableEls.length; i++) {
            jt.resizeIFrameToFitContent(resizableEls[i]);
        }
    }

}

jt.toggleEvent = function(ev) {
    ev.stopPropagation();
    var el = $($(ev.target).parents('.toggle')[0]);
    jt.toggleEl(el);
}

jt.varEl = function(name, value) {
    var div = $('<div class="varEl input-group input-group-sm mt-1 mb-1" style="width: auto;">');
    div.data('varName', name);
    div.data('varValue', value);
    var name = $('<div class="input-group-prepend"><span class="input-group-text">' + name + '</span></div>');
    div.append(name);
    var value = $('<div class="form-control">' + JSON.stringify(value) + '</div>');
    div.append(value);
    div.click(function(ev) {
        jt.appSetVar(ev);
    });
    return div;
}

jt.appSetVar = function(ev) {
    var el = $(ev.target).parents('.varEl');
    var name = el.data('varName');
    var value = el.data('varValue');
    $('#editVarName').text(name);
    $('#appSetVariable-curVal').text(JSON.stringify(value));
    $('#appSetVariable-newVal').val(JSON.stringify(value));
    $('#appSetVariableModal').modal('show');
}

jt.funcEl = function(name, value) {
    var div = $('<div class="input-group input-group-sm mt-1 mb-1">');
    var name = $('<div class="input-group-prepend"><span class="input-group-text">' + name + '</span></div>');
    div.append(name);
    var value = $('<input type="text" class="form-control" value=' + JSON.stringify(value) + '>');
    div.append(value);
    return div;
}

jt.showAppTreeTreamtmentPanels = function(app) {
    var panels = $('[panel-type="treatment-panel"]');
    for (let i=0; i<panels.length; i++) {
        const panel = $(panels[i]);
        if (panel.attr('treatment-id')===app.id) {
            jt.TreatmentPanel_SetTree(panel.find('panel-content'), app);
        }
    }
}

jt.showAppTree = function(app) {

    jt.showAppTreeTreamtmentPanels(app);

    return;

    var appSkip = ['id', 'appjs', 'clientHTML', 'options', 'stages', 'optionValues', 'keyComparisons', 'finished', 'indexInSession', 'periods'];
    var appDefaultVars = ['waitForAll', 'groupMatchingType', 'numPeriods', 'description']
    var stageDefaultVars = ['duration', 'waitToStart', 'waitToEnd', 'onPlaySendPlayer', 'updateObject', 'waitOnTimerEnd'];
    var stageSkip = ['app.index', 'id', 'name', 'groupStart', 'groupEnd', 'playerStart', 'playerEnd', 'canPlayerParticipate'];

    $('#view-app-tree').empty();
    var appTDiv = new ToggleDiv('app', 'App');
    $('#view-app-tree').append(appTDiv.div);
    var appCtnt = appTDiv.contentDiv;

    let varsDiv = jt.varsToggleDiv('app', 'Default variables (0)');
    for (var i in app) {
        if (!appSkip.includes(i)) {
            let div = jt.varEl(i, app[i]);
            if (appDefaultVars.includes(i)) {
                varsDiv.contentDiv.append(div);
            } else {
                appCtnt.append(div);
            }
        }
    }
    varsDiv.name.text('Default variables (' + varsDiv.contentDiv.children().length + ')');
    appCtnt.append(varsDiv.div);
    var stages = app.stages;
    for (var i in stages) {
        var stage = stages[i];
        var stageId = stage;
        if (stage.id !== undefined) {
            stageId = stage.id;
        }
        let stageDiv = new ToggleDiv(stageId, 'Stage ' + stageId);
        stageDiv.titleDiv.addClass('appPreview-stage');
        let stageVarsDiv = jt.varsToggleDiv('vars-' + stageId, 'Default variables (0)');
        for (var j in stage) {
            if (!stageSkip.includes(j)) {
                var varDiv = jt.varEl(j, stage[j]);
                if (stageDefaultVars.includes(j)) {
                    stageVarsDiv.contentDiv.append(varDiv);
                } else {
                    stageDiv.contentDiv.append(varDiv);
                }
            }
        }
        stageDiv.contentDiv.append(stageVarsDiv.div);
        stageVarsDiv.name.text('Default variables (' + stageVarsDiv.contentDiv.children().length + ')');
        var gsDiv = jt.appPreviewStageFnDiv('groupStart', stage.groupStart);
        stageDiv.contentDiv.append(gsDiv.div);
        var psDiv = jt.appPreviewStageFnDiv('playerStart', stage.playerStart);
        stageDiv.contentDiv.append(psDiv.div);

        let screenTD = new ToggleDiv('screen-' + stageId, 'Screen: playing', 'playing');
        var screen = $('<iframe resizeToggle="screen-' + stageId + '-playing" id="stage-' + stageId + '-screen-playing" width="100%" style="height: 15rem;">');
        screenTD.contentDiv.append(screen);
        stageDiv.contentDiv.append(screenTD.div);

        let waitingScrTD = new ToggleDiv('screen-' + stageId, 'Screen: waiting', 'waiting');
        var waitingScr = $('<iframe resizeToggle="screen-' + stageId + '-waiting" id="stage-' + stageId + '-screen-waiting" width="100%" style="height: 15rem;">');
        waitingScrTD.contentDiv.append(waitingScr);
        stageDiv.contentDiv.append(waitingScrTD.div);

        var geDiv = jt.appPreviewStageFnDiv('groupEnd', stage.groupEnd);
        stageDiv.contentDiv.append(geDiv.div);
        var peDiv = jt.appPreviewStageFnDiv('playerEnd', stage.playerEnd);
        stageDiv.contentDiv.append(peDiv.div);

        $('#view-app-tree').append(stageDiv.div);
        // appCtnt.append(stageDiv.div);
    }

    for (var i in app.stages) {
        try {
            var stage = app.stages[i];
            var stageId = stage;
            if (stage.id !== undefined) {
                stageId = stage.id;
            }
            var screen = $('#stage-' + stageId + '-screen-playing');
            screen.contents().find('html').html(jt.showStagePreview(app, stageId, 'playing', screen[0].contentWindow.document.documentElement));
            var waitingScr = $('#stage-' + stageId + '-screen-waiting');
            waitingScr.contents().find('html').html(jt.showStagePreview(app, stageId, 'waiting', waitingScr[0].contentWindow.document.documentElement));
            // jt.resizeIFrameToFitContent(screen[0]);
        } catch (err) {
            debugger;
            console.log(err);
        }
    }

    jt.toggleEl(appTDiv.div);
}

jt.showProps = function(event) {
    console.log('show props');
}

class ToggleDiv {

    constructor(toggleId, title) {
        this.div = $('<div class="toggle" state="closed" toggleId="' + toggleId + '">');

        this.titleDiv = $('<div class="toggleTitleDiv" onclick="jt.toggleEvent(event)">');
        this.expandBtn = $('<i class="far fa-plus-square toggleContentClosed" toggleId="' + toggleId + '"></i>');
        this.minimzBtn = $('<i class="far fa-minus-square toggleContentOpen hidden" toggleId="' + toggleId + '"></i>');
        this.name = $('<div class="ml-1">').text(title);
        this.titleDiv.append(this.expandBtn).append(this.minimzBtn).append(this.name);
        this.div.append(this.titleDiv);

        this.contentDiv = $('<div class="toggleContentDiv toggleContentOpen hidden" toggleId="' + toggleId + '">');
        this.div.append(this.contentDiv);
    }
}

jt.varsToggleDiv = function(id, name) {
    var div = new ToggleDiv('vars-' + id, name);
    div.titleDiv.addClass("appPreview-vars");
    div.contentDiv.addClass('appPreview-varsContent');
    return div;
}

jt.appPreviewStageFnDiv = function(fnName, fnContent) {
    var div = new ToggleDiv('stage-' + fnName, fnName);
    div.titleDiv.addClass("appPreview-func");
    div.contentDiv.text(fnContent);
    div.contentDiv.addClass('appPreview-funcContent');
    return div;
}

window.customElements.define('view-app-preview', ViewAppPreview);
