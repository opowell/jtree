class addAppToRoomModal extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <div class="modal" id="addAppToRoomModal" tabindex="-1" role="dialog">
          <div class="modal-dialog" role="document" style='max-width: 90%;'>
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title" id="exampleModalLabel">Add App to Room</h5>
                      <button type="button" class="close" data-dismiss="modal">
                          <span>&times;</span>
                      </button>
                  </div>
                  <div class="modal-body">
                      <table class='table table-hover'>
                          <thead>
                              <tr>
                                  <th>id</th>
                                  <th>title</th>
                                  <th>description</th>
                              </tr>
                          </thead>
                          <tbody id='addAppToRoomModal-apps'>
                          </tbody>
                      </table>
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-outline-primary" data-dismiss="modal">Close</button>
                  </div>
              </div>
          </div>
      </div>
      `;
    }
}

jt.showAddAppToRoomModal = function() {
    $('#addAppToRoomModal').modal('show');
    $('#addAppToRoomModal-apps').empty();
    for (var i in jt.data.appInfos) {
        var app = jt.data.appInfos[i];
        var row = $('<tr>');
        row.append($('<td>').text(app.id));
        row.append($('<td>').text((app.name !== undefined ? app.name : app.id)));
        row.append($('<td>').text((app.description !== undefined ? app.description : '')));
        row.data('appId', app.id);
        row.click(function(ev) {
            server.roomAddApp($(this).data('appId'));
        });
        $('#addAppToRoomModal-apps').append(row);
    }
}

window.customElements.define('addapptoroom-modal', addAppToRoomModal);
