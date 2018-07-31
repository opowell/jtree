class ViewRoom extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <div id='view-room' class='view hidden'>
          <h2 id='view-room-displayName'></h2>
          <h6 id='view-room-id'></h6>

            <div class="form-group row">
              <div class="col-sm-2 col-form-label">Room link</div>
              <a href='#' class='col-sm-10 col-form-label' id='view-room-roomLink' target='_blank'></a>
            </div>

            <div class="form-group row">
              <label for="view-room-id" class="col-sm-2 col-form-label">Participant links</label>
              <div class="col-sm-10 col-form-label">
                  <div id='view-room-participantLinks' style='display: flex; flex-direction: column; align-items: flex-start;'></div>
              </div>
            </div>

            <div class="form-group row">
              <label for="view-room-id" id='view-room-connected-title' class="col-sm-2 col-form-label">Connected participants</label>
              <div class="col-sm-10">
                  <div id='view-room-labels' style='display: flex; flex-wrap: wrap;'></div>
              </div>
            </div>

            <div class="form-group row">
              <label for="view-room-id" id='view-room-notconnected-title' class="col-sm-2 col-form-label">Not connected participants</label>
              <div class="col-sm-10">
                  <div id='view-room-labels-notconnected' style='display: flex; flex-wrap: wrap;'></div>
              </div>
            </div>

            <div class="form-group row">
               <div class='col-sm-2 col-form-label'>
                   <label id='view-room-notconnected-title'>Apps</label>
                   <button class='btn btn-outline-primary btn-sm' onclick='jt.showAddAppToRoomModal();'>
                       <i class="fa fa-plus"></i>&nbsp;&nbsp;add...
                   </button>
               </div>

              <div class="col-sm-10">
                  <table class='table'>
                      <thead>
                          <tr>
                              <th>id</th>
                              <th>periods</th>
                              <th>actions</th>
                          </tr>
                      </thead>
                      <tbody id='room-apps-table'></tbody>
                  </table>
              </div>
            </div>

            <div class="form-group row">
              <div class="col-sm-10">
                  <button class="btn btn-primary btn-sm" onclick='jt.startSessionFromRoom()'>
                      <i class="fa fa-play"></i>&nbsp;Start session
                  </button>
                <button class="btn btn-outline-primary btn-sm" onclick='setView("edit-room")'>
                    <i class="fa fa-edit"></i>&nbsp;Edit
                </button>
                <button class="btn btn-outline-primary btn-sm">
                    <i class="fa fa-trash"></i>&nbsp;Delete
                </button>
              </div>
            </div>
      </div>
      `;
    }
}

jt.viewRoomUpdateLabel = function(roomPart) {
    if (roomPart.roomId === $('#view-room-id').text()) {
        var label = $('[roomId="' + roomPart.roomId + '"][pId="' + roomPart.id + '"]');
        if (roomPart.clients.length > 0) {
            label.addClass('text-white').addClass('bg-success');
            $('#view-room-labels').append(label);
        } else {
            label.removeClass('text-white').removeClass('bg-success');
            $('#view-room-labels-notconnected').append(label);
        }
        jt.updateViewRoomConnectionNumbers();
    }
}

jt.updateViewRoomConnectionNumbers = function() {
    var connected = 0;
    var notConn = 0;
    var room = jt.getRoom($('#view-room-id').text());
    for (var i in room.participants) {
        if (room.participants[i].clients.length > 0) {
            connected++;
        } else {
            notConn++;
        }
    }
    $('#view-room-connected-title').text('Connected participants (' + connected + ')');
    $('#view-room-notconnected-title').text('Not connected participants (' + notConn + ')');
}

jt.viewRoomShowApp = function(appId) {
    var app = jt.app(appId);
    var div = $('<tr>');
    try {
        div.append($('<td>').text(app.id));
        div.append($('<td>').text(app.numPeriods));

        var aId = app.id;
        var sId = data.session.id;
        var delBtn = $('<button class="btn btn-sm btn-secondary">')
        .click({aId: aId, i: i, sId: sId}, server.roomDeleteApp)
        .text("delete");
        div.append($('<td>').append(delBtn));
    } catch (err) {
    }
    $('#room-apps-table').append(div);
}

function openRoom(room) {
    setView('room');

    $('#view-room-displayName').text(room.displayName);
    $('#view-room-id').text(room.id);
    $('#view-room-roomLink').text(roomLink(room.id));
    $('#view-room-roomLink').attr('href', 'http://' + roomLink(room.id));
    $('#view-room-labels').empty();
    $('#view-room-labels-notconnected').empty();
    $('#view-room-participantLinks').empty();
    jt.updateViewRoomConnectionNumbers();
    $('#room-apps-table').empty();
    for (var i in room.apps) {
        jt.viewRoomShowApp(room.apps[i]);
    }

    $('#edit-room-displayName').text(room.displayName);
    $('#edit-room-displayName-input').val(room.displayName);
    $('#edit-room-id').val(room.id);
    $('#edit-room-useSecureURLs-' + room.useSecureURLs).prop('checked', true);
    $('#edit-room-labels').empty();
    for (var i in room.labels) {
        var label = room.labels[i];
        var labDiv = $('<div class="my-1 view-room-label" roomId="' + room.id + '" pId="' + label + '">').text(label);

        var connected = false;
        for (var j in room.participants) {
            var part = room.participants[j];
            if (part.id === label && part.clients.length > 0) {
                labDiv.addClass('text-white').addClass('bg-success');
                connected = true;
                break;
            }
        }

        if (connected) {
            $('#view-room-labels').append(labDiv);
        } else {
            $('#view-room-labels-notconnected').append(labDiv);
        }


        $('#edit-room-labels').append(label + '\n');
        var prl = partRoomLink(i, room);
        var partLink = $('<a href="http://' + prl + '" target="_blank">' + prl + '</a>');
        $('#view-room-participantLinks').append(partLink);
    }

    $('#edit-room-labels-title').text('Labels (' + room.labels.length + ')');
}

jt.saveRoomAndView = function() {
    jt.saveRoom();
    setView('room');
}

jt.saveRoom = function() {
    var newRoom = {};
    newRoom.originalId = $('#view-room-id').text();
    newRoom.id = $('#edit-room-id').val();
    newRoom.displayName = $('#edit-room-displayName-input').val();
    if ($('#edit-room-useSecureURLs-true').prop('checked')) {
        newRoom.useSecureURLs = true;
    } else {
        newRoom.useSecureURLs = false;
    }
    newRoom.labels = $('#edit-room-labels').val().split('\n');
    server.saveRoom(newRoom);
}

function partRoomLink(i, room) {
    var pId = room.labels[i].trim();
    if (room.useSecureURLs) {
        return roomLink(room.id) + '/' + pId + '/' + room.hashes[i];
    } else {
        return roomLink(room.id) + '/' + pId;
    }
}

window.customElements.define('view-room', ViewRoom);
