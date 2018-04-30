class ViewSessionSettings extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div id='view-session-general' class='session-tab hidden'>

            <div class='tab-grid'>
                <div>Number of participants</div>
                <div>
                    <div>
                        <input id='setNumParticipants' style='width: 3em;' type='number' min='0' step='1'>
                        <button type="button" class="btn btn-sm btn-primary" onclick='setNumParticipants();'>Set</button>
                        <small class="form-text text-muted">
                            Setting the number of participants will turn off login of new participants. Participants are added from the list of session participant IDs. More recent participants are removed first.
                        </small>
                    </div>
                </div>
                <div>Participant labels</div>
                <div>
                    <div>
                        <textarea id='setParticipantLabels' cols=80 rows=10></textarea>
                    </div>
                    <button type="button" class="btn btn-sm btn-primary" onclick='setParticipantLabelss();'>Set</button>
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
                        <select id='deleteParticipantSelect'></select>
                        <button type="button" class="btn btn-sm btn-primary" onclick='deleteParticipantBtn();'>Delete</button>
                        <small class="form-text text-muted">
                            Delete the given participant from the session. Make sure to turn off login of new participants if you wish to prevent clients from re-creating this participant.
                        </small>
                    </div>
                    <div>Labels</div>
                    <div>This is the list of labels for participants.</div>
                </div>

            </div>
    `;
    }
}

updateAllowNewParts = function() {
    $('#allowNewParts')[0].checked = jt.data.session.allowNewParts;
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
