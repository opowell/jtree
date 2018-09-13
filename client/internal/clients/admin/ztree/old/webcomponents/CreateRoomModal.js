class CreateRoomModal extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <div class="modal" id="createRoomModal" tabindex="-1" role="dialog">
          <div class="modal-dialog" role="document" style='max-width: 400px;'>
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title">Create Room</h5>
                      <button type="button" class="close" data-dismiss="modal">
                          <span>&times;</span>
                      </button>
                  </div>
                  <div class="modal-body">
                      Enter name for new room: <input type="text" class="form-control" placeholder="Room id" id='create-room-input' style='flex: 0 0 150px'>
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-sm btn-outline-primary" onclick='jt.createRoom();'>Create</button>
                  </div>
              </div>
          </div>
      </div>
      `;
    }
}

window.customElements.define('createroom-modal', CreateRoomModal);

jt.createRoom = function() {
    var id = $('#create-room-input').val();
    if (id.length > 0) {
        server.createRoom(id);
        $("#createRoomModal").modal("hide");
    }
}
