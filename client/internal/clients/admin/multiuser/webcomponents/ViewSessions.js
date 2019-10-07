class ViewSessions extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <div id='view-sessions' class='view hidden'>
          <h2>Sessions</h2>
          <a href='#' class='mb-2 btn btn-sm btn-outline-secondary btn-sm' onclick='server.sessionCreate();'>
              <i class="fa fa-plus"></i>&nbsp;&nbsp;create
          </a>
          <table class="table table-hover">
            <thead>
              <tr>
                  <th></th>
                <th>id</th>
                <th>participants</th>
                <th users-mode=true>users</th>
                <th>apps</th>
              </tr>
            </thead>
            <tbody id='view-sessions-list'>
            </tbody>
          </table>
      </div>
      `;
    }
}

function showSessions() {
    $('#active-sessions').empty();
    $('#inactive-sessions').empty();
    $('#view-sessions-list').empty();
    for (var i=0; i<jt.data.sessions.length; i++) {
        showSessionRow(jt.data.sessions[i]);
    }
}

window.showSessionRow = function(session) {
    $('#view-sessions-list').prepend(SessionDiv(session));
    $('#active-sessions').prepend(SessionDiv(session));
}

jt.deleteSessionPrompt = function(sessionId) {
    jt.confirm(
        'Are you sure you want to delete Session ' + sessionId + '?',
        function() {
            jt.socket.emit('deleteSession', sessionId);
            setView('sessions');
        }
    );
}

function SessionDiv(session) {
    var row = $('<tr role="button" style="cursor: pointer">');
    var actionDiv = $('<td>');
    var delBtn = jt.DeleteButton();
    delBtn.click(function (ev) {
        ev.stopPropagation();
        var sessionId = $(ev.target).parents('tr').attr('sessionId');
        jt.deleteSessionPrompt(sessionId);
    });
    actionDiv.append(delBtn);
    row.append(actionDiv);
    row.append($('<td>').text(session.id));
    row.append($('<td>').text(session.numParticipants));
    row.append($('<td users-mode=true>').text(session.users));
    row.append($('<td class="truncate">').text(session.numApps + ': ' + session.appSequence));
    var aId = session.id;
    row.attr('sessionId', aId);
    row.click({id: aId, name: aId}, server.openSession);
    return row;
}

window.customElements.define('view-sessions', ViewSessions);
