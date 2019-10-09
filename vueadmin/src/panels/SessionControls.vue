<template>
    <div style='display: block'>
        <div class='btn-group flex-wrap'>
            <button class='btn btn-outline-secondary btn-sm' :disabled='session == null || session.started' onclick='server.sessionStart();'>
                <i class="fa fa-play"></i>&nbsp;&nbsp;Start
            </button>
            <button class='btn btn-outline-secondary btn-sm' onclick='server.sessionAdvanceSlowest();'>
                <i class="fas fa-chevron-right"></i>&nbsp;&nbsp;Advance slowest
            </button>
            <button id='resetSessionBtn' class="btn btn-outline-secondary btn-sm" onclick='server.resetSession()'>
                <i class="fas fa-undo-alt"></i>&nbsp;&nbsp;Reset
            </button>
            <!-- <button class="btn btn-outline-secondary btn-sm" onclick='setView("edit-app")'>
                <i class="fa fa-copy"></i>&nbsp;&nbsp;Duplicate
            </button> -->
            <!-- <button class="btn btn-outline-secondary btn-sm" onclick='server.saveOutput()'>
                <i class="fa fa-save"></i>&nbsp;&nbsp;Save output
            </button> -->
            <button class="btn btn-outline-secondary btn-sm" onclick='jt.downloadOutput()'>
                <i class="fa fa-download"></i>&nbsp;&nbsp;Download output
            </button>
            <button class="btn btn-outline-secondary btn-sm" onclick='jt.deleteSessionPrompt(jt.data.session.id)'>
                <i class="fa fa-trash"></i>&nbsp;&nbsp;Delete...
            </button>
        </div>
    </div>
</template>

<script>

export default {
  name: 'ViewSessionControls',
  data() {
    return {
        session: this.$store.state.session
    }
  },
  props: [
    'dat',
    'panel',
  ],
  mounted() {
      this.panel.id = 'Session Controls';
  },
}

import 'jquery'
let $ = window.jQuery
import jt from '@/webcomps/jtree.js'
import server from '@/webcomps/msgsToServer.js'

jt.downloadOutput = function() {
    window.open("/session-download/" + jt.data.session.id, "_blank", "");
}

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
        jt.participantOpenInNewTabId(pId);
    }
}

jt.participantOpenInNewTabId = function(id) {
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

</script>