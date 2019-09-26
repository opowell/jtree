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

import jt from '@/webcomps/jtree.js'
import $ from 'jquery'
import server from '@/webcomps/msgsToServer.js'

jt.deleteParticipantBtn = function() {
    var pId = $('#deleteParticipantSelect').val();
    server.deleteParticipant(pId);
}

jt.sessionSetAutoplay = function(b) {
    const iframes = $('iframe.participant-frame');
    for (let i=0; i<iframes.length; i++) {
        let pId = $(iframes[i]).data('pId');
        jt.setParticipantAutoplay(pId, b);
    }
}

jt.participantOpenInNewTab = function() {
    for (var i in jt.selectedParticipants) {
        var pId = jt.selectedParticipants[i];
        participantOpenInNewTabId(pId);
    }
}

function participantOpenInNewTabId(id) {
    window.open("http://" + jt.partLink(id));
}

jt.addQueue = function(event) {
    event.stopPropagation();
    console.log('add queue to session: ' + event.data.id + ', name = ' + event.data.name);
    server.addQueue(event.data.id);
}

jt.addAppToSession = function(event) {
    event.stopPropagation();
    console.log('add app to session: ' + event.data.id + ', name = ' + event.data.name);
    server.addAppToSession({id: event.data.id, sId: jt.data.session.id});
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

jt.updatePartClock = function() {
    jt.displayTimeLeft($('#clock-minutes'), $('#clock-seconds'), jt.data.timeLeft);
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
