class ViewAppPreview extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <div id='view-app-preview' style='box-shadow: 0px 0px 11px 2px #888; padding: 15px; display: flex; flex-direction: column'>
        <div id='view-app-compile-error' style='display: none'></div>

          <div id='view-app-tree'></div>

          <div hidden class='view-app-screen'>
            <iframe id='view-app-screen'></iframe>
          </div>

      </div>
      `;
    }
}

import jt from '@/webcomps/jtree.js'
import 'jquery'
let $ = window.jQuery;

jt.updateAppPreview = function() {
    $('#editAppOptionsModal').modal('hide');
    // window.vue.$bvModal.show('editAppOptionsModal');
    let appId = window.vue.$store.state.app.id;
    let optionEls = $('#editAppOptionsModal').find('[app-option-name]');
    let options = jt.deriveAppOptions(optionEls);
    jt.socket.emit('updateAppPreview', {appId: appId, options: options});
}

jt.showAppError = function(app) {
    let el = $('#view-app-compile-error');
    if (app.hasError) {
        el.html(`<div style='color: red'>
            <i class="fas fa-exclamation-triangle"></i>&nbsp;&nbsp;Error: line ${app.errorLine}, pos ${app.errorPosition}
            </div>`);
        el.css('display', 'block');
    } else {
        el.css('display', 'none');
    }
}

jt.showAppPreview = function(app) {
    $('.view-app-screen').resizable();
    jt.showAppError(app);
    jt.showAppTree(app);
    let appMetaData = jt.app(app.id);
    try {
        let els = $($.parseHTML(appMetaData.clientHTML));
        let stageEls = els.find('[jt-stage]');
        for (let i=0; i<stageEls.length; i++) {
            let stageEl = $(stageEls[i]);
            let id = stageEl.attr('jt-stage');
            let found = false;
            for (let j in app.stages) {
                if (app.stages[j].id === id) {
                    found = true;
                }
            }
            if (!found) {
                stageEl.css('display', 'none');
            }
        }
        let textEls = els.find('[jt-text]');
        for (let i=0; i<textEls.length; i++) {
            let textEl = $(textEls[i]);
            let text = textEl.attr('jt-text');
            try {
                let evalText = eval(text);
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

        let dispIfEls = els.find('[jt-displayIf]');
        for (let i=0; i<dispIfEls.length; i++) {
            let el = $(dispIfEls[i]);
            el.css('background-color', '#ffe9c1');
            el.attr('title', 'Displayed if: ' + el.attr('jt-displayIf'));
        }

        let html = '';
        for (let i=0; i<els.length; i++) {
            let el = $(els[i]);
            if (el.html() !== undefined) {
                html = html + el.html();
            }
        }
        $('#view-app-clientpreview').contents().find('html').html(html);
//        jt.resizeIFrameToFitContent($('#view-app-clientpreview')[0]);
     let optionEls = $('#editAppOptionsModal').find('[app-option-name]');
    let options = jt.deriveAppOptions(optionEls);

        jt.setEditAppOptionsData(app, options, jt.updateAppPreview);
    } catch (err) {
        console.log(err);
    }
}

jt.showStagePreview = function(app, stageId, status, doc) {
    let appMetaData = jt.app(app.id);
    try {
        let trimmedHTML = $.trim(appMetaData.clientHTML);

        let els = $($.parseHTML(trimmedHTML), doc);
        let statusEls = els.find('[jt-status]').addBack('[jt-status]');
        for (let i=0; i<statusEls.length; i++) {
            let statusEl = $(statusEls[i]);
            let id = statusEl.attr('jt-status');
            // DEPRECATED:
            // change all jt-status tags with 'active', to 'playing'
            if (id === 'active') {
                id = 'playing';
            }

            let found = id === status;
            if (!found) {
                statusEl.css('display', 'none');
            }
        }
        let stageEls = els.find('[jt-stage]').addBack('[jt-stage]');
        for (let i=0; i<stageEls.length; i++) {
            let stageEl = $(stageEls[i]);
            let id = stageEl.attr('jt-stage');
            let found = id === stageId;
            if (!found) {
                stageEl.css('display', 'none');
            }
        }
        let textEls = els.find('[jt-text]').addBack('[jt-text]');
        for (let i=0; i<textEls.length; i++) {
            let textEl = $(textEls[i]);
            let text = textEl.attr('jt-text');
            try {
                let evalText = eval(text);
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

        let dispIfEls = els.find('[jt-displayIf]').addBack('[jt-displayIf]');
        for (let i=0; i<dispIfEls.length; i++) {
            let el = $(dispIfEls[i]);
            let dispCond = el.attr('jt-displayIf');
            try {
                let evalText = eval(dispCond);
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

        let html = '';
        for (let i=0; i<els.length; i++) {
            let el = $(els[i]);
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
    let toggleId = el.attr('toggleId');
    if (el.attr('state') === 'open') {
        el.find('.toggleContentOpen[toggleId=' + toggleId + ']').addClass('hidden');
        el.find('.toggleContentClosed[toggleId=' + toggleId + ']').removeClass('hidden');
        el.attr('state', 'closed');
    } else {
        el.find('.toggleContentOpen[toggleId=' + toggleId + ']').removeClass('hidden');
        el.find('.toggleContentClosed[toggleId=' + toggleId + ']').addClass('hidden');
        el.attr('state', 'open');
        let resizableEls = $(el).find('[resizeToggle=' + toggleId + ']');
        for (let i=0; i<resizableEls.length; i++) {
            jt.resizeIFrameToFitContent(resizableEls[i]);
        }
    }

}

jt.toggleEvent = function(ev) {
    ev.stopPropagation();
    let el = $($(ev.target).parents('.toggle')[0]);
    jt.toggleEl(el);
}

jt.varEl = function(name, value) {
    let div = $('<div class="varEl input-group input-group-sm mt-1 mb-1" style="width: auto;">');
    div.data('varName', name);
    div.data('varValue', value);
    let funcPrefix = '__func_';
    let isFunc = false;
    if (name.startsWith(funcPrefix)) {
        name = name.substring(funcPrefix.length);
        isFunc = true;
    }
    
    let nameEl = $('<div class="input-group-prepend"><span class="input-group-text" style="align-items: start">' + name + '</span></div>');
    div.append(nameEl);
    let valueDiv = $('<div class="form-control" style="height: auto">' + JSON.stringify(value) + '</div>');
    if (isFunc) {
        valueDiv.css('white-space', 'pre-wrap');
        valueDiv[0].innerHTML = value;
    }
    div.append(valueDiv);
    div.click(function(ev) {
        jt.appSetVar(ev);
    });
    return div;
}

jt.appSetVar = function(ev) {
    let el = $(ev.target).parents('.varEl');
    let name = el.data('varName');
    let value = el.data('varValue');
    $('#editVarName').text(name);
    $('#appSetVariable-curVal').text(JSON.stringify(value));
    $('#appSetVariable-newVal').val(JSON.stringify(value));
    $('#appSetVariableModal').modal('show');
    // window.vue.$bvModal.show('appSetVariableModal');
}

jt.funcEl = function(name, value) {
    let div = $('<div class="input-group input-group-sm mt-1 mb-1">');
    let nameEl = $('<div class="input-group-prepend"><span class="input-group-text">' + name + '</span></div>');
    div.append(nameEl);
    let valueEl = $('<input type="text" class="form-control" value=' + JSON.stringify(value) + '>');
    div.append(valueEl);
    return div;
}

jt.showAppTree = function(app) {

    let appSkip = [
        'id', 
        'appjs', 
        'clientHTML', 
        'options',
        'stages',
        'optionValues',
        'keyComparisons',
        'finished',
        'appDir',
        'appFilename',
        'shortId',
        'appPath',
        'started',
        'indexInSession',
        'periods',
        'textMarkerBegin',
        'textMarkerEnd',
        'isStandaloneApp',
        'hasError',
        'errorLine',
        'errorPosition',
    ];
    let appDefaultVars = ['waitForAll', 'groupMatchingType', 'numPeriods', 'description', 'outputDelimiter', 'duration', 'useVue', 'periodText', 'vueModels', 'vueComputed', 'vueMethods', 'vueMethodsDefaults', 'clientScripts', 'modifyPathsToIncludeId', 'stageWaitToStart', 'stageWaitToEnd', 'givenOptions', 'title', "waitingScreen"];
    let stageDefaultVars = ['duration', 'waitToStart', 'waitToEnd', 'onPlaySendPlayer', 'updateObject', 'waitOnTimerEnd', 'showTimer', 'clientDuration', 'useAppActiveScreen', 'useAppWaitingScreen', 'wrapPlayingScreenInFormTag', 'addOKButtonIfNone', 'activeScreen', 'waitingScreen', 'stages', 'repetitions', 'autoplay', 'getGroupDuration'];
    let stageSkip = ['app.index', 'id', 'name', 'groupStart', 'groupEnd', 'playerStart', 'playerEnd', 'canPlayerParticipate'];

    $('#view-app-tree').empty();
    let appTDiv = new ToggleDiv('app', 'App');
    $('#view-app-tree').append(appTDiv.div);
    let appCtnt = appTDiv.contentDiv;

    let varsDiv = jt.varsToggleDiv('app', 'Default variables (0)');
    for (let i in app) {
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
    let stages = app.stages;
    for (let i in stages) {
        let stage = stages[i];
        let stageId = stage;
        if (stage.id !== undefined) {
            stageId = stage.id;
        }
        let stageDiv = new ToggleDiv(stageId, 'Stage ' + stageId);
        stageDiv.titleDiv.addClass('appPreview-stage');
        let stageVarsDiv = jt.varsToggleDiv('vars-' + stageId, 'Default variables (0)');
        for (let j in stage) {
            if (!stageSkip.includes(j)) {
                let varDiv = jt.varEl(j, stage[j]);
                if (stageDefaultVars.includes(j)) {
                    stageVarsDiv.contentDiv.append(varDiv);
                } else {
                    stageDiv.contentDiv.append(varDiv);
                }
            }
        }
        stageDiv.contentDiv.append(stageVarsDiv.div);
        stageVarsDiv.name.text('Default variables (' + stageVarsDiv.contentDiv.children().length + ')');
        let gsDiv = jt.appPreviewStageFnDiv('groupStart', stage.groupStart);
        stageDiv.contentDiv.append(gsDiv.div);
        let psDiv = jt.appPreviewStageFnDiv('playerStart', stage.playerStart);
        stageDiv.contentDiv.append(psDiv.div);

        let screenTD = new ToggleDiv('screen-' + stageId, 'Screen: playing', 'playing');
        // let screen = $('<iframe resizeToggle="screen-' + stageId + '-playing" id="stage-' + stageId + '-screen-playing" width="100%" style="height: 15rem;">');
        let screen = $('<div id="stage-' + stageId + '-screen-playing">').html('<pre style="overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; border: 1px solid"><code>' + stage.activeScreen.replace(/</g, '&lt') + '</code></pre>');
        screenTD.contentDiv.append(screen);
        stageDiv.contentDiv.append(screenTD.div);

        let waitingScrTD = new ToggleDiv('screen-' + stageId, 'Screen: waiting', 'waiting');
        if (stage.waitingScreen == null) {
            stage.waitingScreen = '';
        }
        if (stage.useAppWaitingScreen) {
            stage.waitingScreen = app.waitingScreen;
        }
        
        let waitingScr = $('<div id="stage-' + stageId + '-screen-playing">').html('<pre style="overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; border: 1px solid"><code>' + stage.waitingScreen.replace(/</g, '&lt') + '</code></pre>');
        waitingScrTD.contentDiv.append(waitingScr);
        stageDiv.contentDiv.append(waitingScrTD.div);

        let geDiv = jt.appPreviewStageFnDiv('groupEnd', stage.groupEnd);
        stageDiv.contentDiv.append(geDiv.div);
        let peDiv = jt.appPreviewStageFnDiv('playerEnd', stage.playerEnd);
        stageDiv.contentDiv.append(peDiv.div);

        $('#view-app-tree').append(stageDiv.div);
        // appCtnt.append(stageDiv.div);
    }

    // for (let i in app.stages) {
    //     try {
    //         let stage = app.stages[i];
    //         let stageId = stage;
    //         if (stage.id !== undefined) {
    //             stageId = stage.id;
    //         }
    //         // let screen = $('#stage-' + stageId + '-screen-playing');
    //         // screen.contents().find('html').html(jt.showStagePreview(app, stageId, 'playing', screen[0].contentWindow.document.documentElement));
    //         // let waitingScr = $('#stage-' + stageId + '-screen-waiting');
    //         // waitingScr.contents().find('html').html(jt.showStagePreview(app, stageId, 'waiting', waitingScr[0].contentWindow.document.documentElement));
    //         // jt.resizeIFrameToFitContent(screen[0]);
    //     } catch (err) {
    //         debugger;
    //         console.log(err);
    //     }
    // }

    jt.toggleEl(appTDiv.div);
}

jt.showProps = function() {
    console.log('show props');
}

class ToggleDiv {

    constructor(toggleId, title) {
        this.div = $('<div class="toggle" state="closed" toggleId="' + toggleId + '">');

        this.titleDiv = $('<div class="toggleTitleDiv" onclick="jt.toggleEvent(event)">');
        this.expandBtn = $('<i class="far fa-plus-square toggleContentClosed" toggleId="' + toggleId + '"></i>');
        this.minimzBtn = $('<i class="far fa-minus-square toggleContentOpen hidden" toggleId="' + toggleId + '"></i>');
                // this.expandBtn = $(`
        // <font-awesome-icon 
        // toggleId="' + toggleId + '" 
        // class="toggleContentClosed" 
        // :icon="['far', 'plus-square']"
        // />
        // `);
        // this.minimzBtn = $(`
        // <font-awesome-icon 
        // toggleId="' + toggleId + '" 
        // class="toggleContentOpen hidden" 
        // :icon="['far', 'minus-square']"
        // />
        // `);
        this.name = $('<div class="ml-1">').text(title);
        this.titleDiv.append(this.expandBtn).append(this.minimzBtn).append(this.name);
        this.div.append(this.titleDiv);

        this.contentDiv = $('<div class="toggleContentDiv toggleContentOpen hidden" toggleId="' + toggleId + '">');
        this.div.append(this.contentDiv);
    }
}

jt.varsToggleDiv = function(id, name) {
    let div = new ToggleDiv('vars-' + id, name);
    div.titleDiv.addClass("appPreview-vars");
    div.contentDiv.addClass('appPreview-varsContent');
    return div;
}

jt.appPreviewStageFnDiv = function(fnName, fnContent) {
    let div = new ToggleDiv('stage-' + fnName, fnName);
    div.titleDiv.addClass("appPreview-func");
    div.contentDiv.text(fnContent);
    div.contentDiv.addClass('appPreview-funcContent');
    return div;
}

window.customElements.define('view-app-preview', ViewAppPreview);
