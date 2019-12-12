class ViewSessionSettings extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div id='view-session-general' class='session-tab hidden'>

            <div class='tab-grid'>
                <div>Id</div>
                <div>
                    <input id='view-session-id-input' type='text'>
                    <button type="button" class="btn btn-sm btn-primary" onclick='setSessionId();'>Set</button>
                    <small class="form-text text-muted">
                        Must be unique across all sessions. Clients must be reconnected after change.
                    </small>
                </div>
                <div>Number of participants</div>
                <div>
                    <div>
                        <input id='setNumParticipantsInput' style='width: 3em;' type='number' min='0' step='1'>
                        <button id='setNumParticipantsBtn' type="button" class="btn btn-sm btn-primary" onclick='setNumParticipants();'>Set</button>
                        <small class="form-text text-muted">
                            Setting the number of participants will turn off login of new participants. Participants are added from the list of session participant IDs. More recent participants are removed first.
                        </small>
                    </div>
                </div>
                <div>Allow admin play</div>
                <div>
                    <div>
                        <div class="btn-group" role="group" aria-label="Basic example">
                            <button id='allowAdminPlayYes' type="button" class="btn btn-sm btn-outline-success" onclick='setAllowAdminPlay(true);'>Yes</button>
                            <button id='allowAdminPlayNo' type="button" class="btn btn-sm btn-outline-success" onclick='setAllowAdminPlay(false);'>No</button>
                        </div>
                        <small class="form-text text-muted">
                            Allows admin clients to "play" (or not) as participants.
                        </small>
                    </div>
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
                    <select id='deleteParticipantSelect'></select>
                    <button type="button" class="btn btn-sm btn-primary" onclick='deleteParticipantBtn();'>Delete</button>
                    <small class="form-text text-muted">
                        Delete the given participant from the session. Make sure to turn off login of new participants if you wish to prevent clients from re-creating this participant.
                    </small>
                </div>
            </div>

        </div>
    `;
    }
}

setSessionId = function() {
    let newId = $('#view-session-id-input').val();
    let origId = jt.data.session.id;
    server.setSessionId(origId, newId);
}

setNumParticipants = function() {
    jt.disableButton('setNumParticipantsBtn', 'Setting...');
    const amt = $('#setNumParticipantsInput').val();
    let cb = function() {
        jt.enableButton('setNumParticipantsBtn', 'Set');
        jt.popupMessage('Set number of participants = ' + amt);
    }
    server.setNumParticipants(amt, cb);
}

setAllowAdminPlay = function(val) {
    server.setAllowAdminPlay(val);
}

updateAllowNewParts = function() {
    $('#allowNewParts')[0].checked = jt.data.session.allowNewParts;
}

updateAllowAdminPlay = function() {
    let val = jt.data.session.allowAdminClientsToPlay;
    if (val) {
        $('#allowAdminPlayYes').addClass('btn-success');
        $('#allowAdminPlayYes').removeClass('btn-outline-success');
        $('#allowAdminPlayNo').removeClass('btn-success');
        $('#allowAdminPlayNo').addClass('btn-outline-success');
    } else {
        $('#allowAdminPlayYes').removeClass('btn-success');
        $('#allowAdminPlayYes').addClass('btn-outline-success');
        $('#allowAdminPlayNo').addClass('btn-success');
        $('#allowAdminPlayNo').removeClass('btn-outline-success');
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
    viewAllParticipants();
}

jt.setCaseSensitiveLabels = function() {
    $('#caseSensitiveLabels')[0].checked = jt.data.session.caseSensitiveLabels;
}

function updateSessionCanPlay(session) {
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

window.customElements.define('view-session-settings', ViewSessionSettings);
