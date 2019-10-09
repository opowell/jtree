<template>
    <div id='view-session-general' style='display: block'>
        <div class='tab-grid'>
            <div>Id</div>
            <div>
                <input id='view-session-id-input' type='text' :value="session.id">
                <button type="button" class="btn btn-sm btn-primary" onclick='jt.setSessionId();'>Set</button>
                <small class="form-text text-muted">
                    Must be unique across all sessions. Clients must be reconnected after change.
                </small>
            </div>
            <div>Number of participants</div>
            <div>
                <div>
                    <input id='setNumParticipantsInput' :value='numParts' style='width: 3em;' type='number' min='0' step='1'>
                    <button id='setNumParticipantsBtn' type="button" class="btn btn-sm btn-primary" onclick='jt.setNumParticipants();'>Set</button>
                    <small class="form-text text-muted">
                        Setting the number of participants will turn off login of new participants. Participants are added from the list of session participant IDs. More recent participants are removed first.
                    </small>
                </div>
            </div>
            <div>Allow admin play</div>
            <div>
                <div>
                    <div class="btn-group" role="group" aria-label="Basic example">
                        <button id='allowAdminPlayYes' type="button" class="btn btn-sm btn-outline-secondary" onclick='jt.setAllowAdminPlay(true);'>Yes</button>
                        <button id='allowAdminPlayNo' type="button" class="btn btn-sm btn-outline-secondary" onclick='jt.setAllowAdminPlay(false);'>No</button>
                    </div>
                    <small class="form-text text-muted">
                        Allows admin clients to "play" (or not) as participants.
                    </small>
                </div>
            </div>
            <div>Participant labels</div>
            <div>
                <div>
                    <textarea id='setParticipantLabels' cols=80 rows=10></textarea>
                </div>
                <button type="button" class="btn btn-sm btn-primary" onclick='jt.setParticipantLabels();'>Set</button>
                <small class="form-text text-muted">
                    Each label should be seperated by a comma and/or new line. Setting the participant labels will turn off login of new participants and set the number of participants.
                </small>
            </div>
            <div>Login of new participants</div>
            <div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="" id="allowNewParts" onclick='server.setAllowNewParts();'>
                    <label class="form-check-label" for="allowNewParts">
                        Allow
                    </label>
                </div>
                <small class="form-text text-muted">
                        This allows clients to log in as a participant before the participant exists in the session. It does not prevent clients logging in as participants that already exist in the session.
                </small>
            </div>
            <div>Case sensitive labels</div>
            <div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="" id="caseSensitiveLabels" onclick='server.setCaseSensitiveLabels();'>
                    <label class="form-check-label" for="allowNewParts">
                        Active
                    </label>
                </div>
                <small class="form-text text-muted">
                    Whether or not participant labels are case sensitive. When active, "p1" and "P1" are distinct participants.
                </small>
            </div>

            <div>
                Delete participant
            </div>
            <div>
                <select id='deleteParticipantSelect'>
                    <option v-for='part in session.participants' :key='part.id'>{{part.id}}</option>
                </select>
                <button type="button" class="btn btn-sm btn-primary" onclick='deleteParticipantBtn();'>Delete</button>
                <small class="form-text text-muted">
                    Delete the given participant from the session. Make sure to turn off login of new participants if you wish to prevent clients from re-creating this participant.
                </small>
            </div>
            <div>Labels</div>
            <div>This is the list of labels for participants.</div>
        </div>
    </div>
</template>

<script>

import store from '@/store.js'
import jt from '@/webcomps/jtree.js'

export default {
  name: 'ViewSessionSettings',
  data() {
    return {
        session: this.$store.state.session
    }
  },
  props: [
    'dat',
    'panel',
  ],
  computed: {
      numParts() {
        return Object.keys(this.session.participants).length;
      }
  },
  mounted() {
      this.panel.id = 'Session Settings';
        jt.updateAllowAdminPlay();
  },
}

import 'jquery'
let $ = window.jQuery
import server from '@/webcomps/msgsToServer.js'

jt.setSessionId = function() {
    let newId = $('#view-session-id-input').val();
    let origId = jt.data.session.id;
    server.setSessionId(origId, newId);
}

jt.setNumParticipants = function() {
    jt.disableButton('setNumParticipantsBtn');
    const amt = $('#setNumParticipantsInput').val();
    let cb = function() {
        jt.enableButton('setNumParticipantsBtn');
        jt.popupMessage('Set number of participants = ' + amt);
        jt.addLog('Set number of participants = ' + amt);

    }
    server.setNumParticipants(amt, cb);
}

jt.setAllowAdminPlay = function(val) {
    server.setAllowAdminPlay(val);
}

// jt.updateAllowNewParts = function() {
//     $('#allowNewParts')[0].checked = jt.data.session.allowNewParts;
// }

jt.updateAllowAdminPlay = function() {
    if (store.state.session == null) {
        return;
    }
    let val = store.state.session.allowAdminClientsToPlay;
    if (val) {
        $('#allowAdminPlayYes').addClass('btn-secondary');
        $('#allowAdminPlayYes').removeClass('btn-outline-secondary');
        $('#allowAdminPlayNo').removeClass('btn-secondary');
        $('#allowAdminPlayNo').addClass('btn-outline-secondary');
    } else {
        $('#allowAdminPlayYes').removeClass('btn-secondary');
        $('#allowAdminPlayYes').addClass('btn-outline-secondary');
        $('#allowAdminPlayNo').addClass('btn-secondary');
        $('#allowAdminPlayNo').removeClass('btn-outline-secondary');
    }

    let views = $('.participant-view');
    for (let i=0; i<views.length; i++) {
        let view = $(views[i]);
        if (val) {
            $(view.children()[0]).css('background-color', '#cfe8cf');
        } else {
            $(view.children()[0]).css('background-color', '');
        }
    }
    jt.viewAllParticipants();
}

jt.setCaseSensitiveLabels = function() {
    $('#caseSensitiveLabels')[0].checked = jt.data.session.caseSensitiveLabels;
}

jt.updateSessionCanPlay = function(session) {
    if (session.isRunning) {
        $('#sessionResumeBtn').addClass('disabled');
        $('#sessionPauseBtn').removeClass('disabled');
        $('#session-canPlay').text('running');
    } else {
        $('#sessionResumeBtn').removeClass('disabled');
        $('#sessionPauseBtn').addClass('disabled');
        $('#session-canPlay').text('paused');
    }
}

</script>