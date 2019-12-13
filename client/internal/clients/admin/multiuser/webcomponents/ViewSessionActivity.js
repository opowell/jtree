class ViewSessionActivity extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <!-- SESSION - ACTIVITY -->
        <div id='view-session-activity' class='session-tab hidden'>
            <div class='btn-group mb-3'>
                <span class="btn btn-outline-primary btn-sm" onclick='viewAllParticipants()'>
                    <i class="fa fa-eye"></i>&nbsp;&nbsp;show all
                </span>
                <span class="btn btn-outline-primary btn-sm" onclick='hideAllParticipants()'>
                    <i class="fa fa-times"></i>&nbsp;&nbsp;close all
                </span>
                <span class='btn btn-outline-primary btn-sm' id='startAutoplay' onclick='server.setAutoplayForAll(true);'>
                    <span class='px-1' style='border: 1px solid; border-radius: 0.3rem;'>A</span>&nbsp;&nbsp;start autoplay
                </span>
                <span class='btn btn-outline-primary btn-sm' id='stopAutoplay' onclick='server.setAutoplayForAll(false);'>
                    <span>A</span>&nbsp;&nbsp;stop autoplay
                </span>
                <span class="btn btn-outline-primary btn-sm" onclick='jt.showSetAutoplayFreqModal()'>
                    <i class="fa fa-stopwatch"></i>&nbsp;&nbsp;set autoplay delay...
                </span>
                <span class="btn btn-outline-primary btn-sm" onclick='jt.setViewSize()'>
                    <i class="fa fa-expand"></i>&nbsp;&nbsp;set size...
                </span>
            </div>
            <div id='views'></div>
        </div>
    `;
    }
}

document.write('<script src="/admin/multiuser/webcomponents/SetAutoplayFreqModal.js"></script>');

function viewAllParticipants() {
    let ids = Object.keys(jt.data.session.participants);
    alphanumSort(ids);

    for (var i in ids) {
        let pId = ids[i];
        var participant = jt.data.session.participants[pId];
        viewParticipant(participant.id);
    }
}

function hideAllParticipants() {
    $('#views').empty();
}

jt.closeParticipantView = function(pId) {
    $('#panel-session-participant-' + pId).remove();
}

jt.refreshParticipantView = function(pId) {
    var panel = $('#participant-frame-' + pId)[0];
    panel.src = panel.src;
}

function viewParticipant(pId) {
    const view = new ParticipantView(pId);
    const elId = 'session-participant-' + pId;
    const existsAlready = $('#panel-' + elId).length > 0;
    const panel = addPanel(elId, 'Participant ' + pId, view);
    $('#panel-' + elId.replace(/\./g, '\\\\.')).addClass('participant-view');
    if (!existsAlready) {

        var closeBtn = $('<button type="button" class="headerBtn close float-right"><i title="close" class="fa fa-times"></i></button>');
        closeBtn.click(function() {
            jt.closeParticipantView(pId);
        });
        $($(panel).children()[0]).append(closeBtn);

        var newWinBtn = $('<button type="button" class="headerBtn close float-right"><i title="open in new window" class="fa fa-external-link-alt"></i></button>');
        newWinBtn.click(function() {
            participantOpenInNewTabId(pId);
        });
        $($(panel).children()[0]).append(newWinBtn);

        var autoplayBtn = $('<button title="toggle autoplay" id="' + pId + '-autoplay" type="button" class="headerBtn close float-right">A</button>');
        autoplayBtn.click(function() {
            toggleParticipantAutoplay(pId);
        });
        $($(panel).children()[0]).append(autoplayBtn);

        var refreshBtn = $('<button type="button" class="headerBtn close float-right"><i title="refresh" class="fa fa-redo-alt"></i></button>');
        refreshBtn.click(function() {
            jt.refreshParticipantView(pId);
        });
        $($(panel).children()[0]).append(refreshBtn);

    }
    if (jt.data.session.allowAdminClientsToPlay) {
        $($(panel).children()[0]).css('background-color', '#cfe8cf');
    }
    showPanel('#panel-' + elId, 0, 0, '', '', '', '', false);
    $('#views').append(panel);
}

function toggleParticipantAutoplay(pId) {
    const elId = 'panel-session-participant-' + safePId(pId);
    const el = $('#' + elId);
    const apEl = $('#' + safePId(pId) + '-autoplay');
    setParticipantAutoplay(pId, !apEl.hasClass('headerBtn-on'));
}

function setParticipantAutoplay(pId, b) {
    const elId = 'panel-session-participant-' + pId;
    const el = $('#' + elId);
    const apEl = $('#' + pId + '-autoplay');
    if (b) {
        apEl.addClass('headerBtn-on');
    } else {
        apEl.removeClass('headerBtn-on');
    }
    server.setAutoplay(pId, b);
    // let iframe = el.find('iframe')[0];
    // if (iframe.contentWindow.setAutoplay !== undefined) {
    //     iframe.contentWindow.setAutoplay(b);
    // }
}

function ParticipantView(pId) {
    if (jt.data.session !== null && jt.data.session !== undefined) {
        var url = 'http://' + partLink(pId);
        var frame = $('<iframe>', {
            id:  'participant-frame-' + pId
        });
        $(frame).data('pId', pId);
        frame.attr('src', url);
        frame.addClass('participant-frame');
        return frame;
    } else {
        return null;
    }
}

window.customElements.define('view-session-activity', ViewSessionActivity);
