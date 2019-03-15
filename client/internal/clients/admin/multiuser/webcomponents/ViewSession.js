class ViewSession extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
<div id='view-session' class='view hidden'>
    <h2 id='session-id'></h2>
    <view-session-controls></view-session-controls>
    <view-session-tabs></view-session-tabs>
    <view-session-settings></view-session-settings>
    <view-session-apps></view-session-apps>
    <view-session-participants></view-session-participants>
    <view-session-activity></view-session-activity>
    <view-session-results></view-session-results>
    <view-session-users></view-session-users>
</div>
    `;
    }
}

document.write('<script src="/admin/multiuser/webcomponents/ViewSessionActivity.js"></script>');
document.write('<script src="/admin/multiuser/webcomponents/ViewSessionApps.js"></script>');
document.write('<script src="/admin/multiuser/webcomponents/ViewSessionControls.js"></script>');
document.write('<script src="/admin/multiuser/webcomponents/ViewSessionParticipants.js"></script>');
document.write('<script src="/admin/multiuser/webcomponents/ViewSessionResults.js"></script>');
document.write('<script src="/admin/multiuser/webcomponents/ViewSessionSettings.js"></script>');
document.write('<script src="/admin/multiuser/webcomponents/ViewSessionTabs.js"></script>');
document.write('<script src="/admin/multiuser/webcomponents/ViewSessionUsers.js"></script>');

deleteParticipantBtn = function() {
    var pId = $('#deleteParticipantSelect').val();
    server.deleteParticipant(pId);
}

function sessionSetAutoplay(b) {
    const iframes = $('iframe.participant-frame');
    for (let i=0; i<iframes.length; i++) {
        let pId = $(iframes[i]).data('pId');
        setParticipantAutoplay(pId, b);
    }
}

function participantOpenInNewTab() {
    for (var i in selectedParticipants) {
        var pId = selectedParticipants[i];
        participantOpenInNewTabId(pId);
    }
}

function participantOpenInNewTabId(id) {
    window.open("http://" + partLink(id));
}

function addQueue(event) {
    event.stopPropagation();
    console.log('add queue to session: ' + event.data.id + ', name = ' + event.data.name);
    server.addQueue(event.data.id);
}

function addAppToSession(event) {
    event.stopPropagation();
    console.log('add app to session: ' + event.data.id + ', name = ' + event.data.name);
    server.addAppToSession({id: event.data.id, sId: data.session.id});
}

jt.deleteSession = function() {
    var sId = $('#session-id').text();
    jt.confirm(
        'Are you sure you want to delete Session ' + sId + '?',
        function() {
            jt.socket.emit('deleteSession', sId);
        }
    );
}

function updatePartClock() {
    displayTimeLeft($('#clock-minutes'), $('#clock-seconds'), data.timeLeft);
}

jt.setSessionView = function(a) {
    jt.setSubView('session', a);
    // Do not hide 'Activity' tab, instead move it off screen.
    let actEl = $('#view-session-activity');
    if (actEl.hasClass('hidden')) {
        actEl.css('top', '-10000px');        
        actEl.css('position', 'absolute');        
        actEl.removeClass('hidden');
    } else {
        actEl.css('top', '');
        actEl.css('position', '');        
    }
}

jt.showSessionId = function(id) {
    $('#session-id').text(id);
    $('#view-session-id-input').val(id);
}

window.customElements.define('view-session', ViewSession);
