class ViewRooms extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <div id='view-rooms' class='view hidden'>
          <h2>Rooms</h2>
          <div class="mb-3">
            <a href='#' class='btn btn-outline-primary btn-sm' onclick='jt.showCreateRoomModal();'>
                <i class="fa fa-plus"></i>&nbsp;&nbsp;create...
            </a>
          </div>
          <div id='rooms-list'></div>
      </div>
      `;
    }
}

jt.showCreateRoomModal = function() {
    $("#createRoomModal").modal("show");
}

function showRooms() {
    $('#rooms-list').empty();
    for (var i in jt.data.rooms) {
        var room = jt.data.rooms[i];
        showRoom(room);
    }
}

function showRoom(room) {
    var div = $('<div class="card my-1" style="width: 25rem;">');
    var body = $('<div class="card-body">');
    div.append(body);
    var title = $('<h6 class="card-title">').text(room.displayName + ' (' + room.id + ')');
    var propsDiv = $('<div>');

    body.append(title);
    div.click(function() {
        openRoom(room);
    });
    $('#rooms-list').append(div);
}

window.customElements.define('view-rooms', ViewRooms);
