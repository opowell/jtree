class addUserToSessionModal extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <div class="modal" id="addUserToSessionModal" tabindex="-1" role="dialog">
          <div class="modal-dialog" role="document" style='max-width: 90%;'>
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title">Add User to Session</h5>
                      <button type="button" class="close" data-dismiss="modal">
                          <span>&times;</span>
                      </button>
                  </div>
                  <div class="modal-body">
                      <table class='table table-hover'>
                          <thead>
                              <tr>
                                  <th>id</th>
                              </tr>
                          </thead>
                          <tbody id='addUserToSessionModal-users'>
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

window.customElements.define('addusertosession-modal', addUserToSessionModal);

jt.showAddUserToSessionModal = function() {
    $('#addUserToSessionModal').modal('show');
    $('#addUserToSessionModal-users').empty();
    for (var i in jt.data.users) {
        var user = jt.data.users[i];
        var row = jt.UserRow(user, ['id']);
        row.data('uId', user.id);
        row.click(function(ev) {
            var uId = $(this).data('uId');
            jt.socket.emit('sessionAddUser', {sId: jt.data.session.id, uId: uId});
            $('#addUserToSessionModal').modal('hide');
        });
        row.css('cursor', 'pointer');

        $('#addUserToSessionModal-users').append(row);
    }
}
