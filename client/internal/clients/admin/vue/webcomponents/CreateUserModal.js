class CreateUserModal extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <div class="modal" id="createUserModal" tabindex="-1" role="dialog">
          <div class="modal-dialog" role="document" style='max-width: 400px;'>
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title">Create New User</h5>
                      <button type="button" class="close" data-dismiss="modal">
                          <span>&times;</span>
                      </button>
                  </div>
                  <div class="modal-body">
                    <span>
                        Type: <select class="form-control" id='create-user-type'>
                            <option value='regular'>regular</option>
                            <option value='administrator'>administrator</option>
                        </select>
                        </span>
                        <span>
                          Id: <input type="text" class="form-control" placeholder="Username" id='create-user-input' style='flex: 0 0 150px'>
                          </span>
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-sm btn-outline-primary" onclick='jt.createUser();'>Create</button>
                  </div>
              </div>
          </div>
      </div>
      `;
    }
}

window.customElements.define('createuser-modal', CreateUserModal);

jt.showCreateUserModal = function() {
    $("#createUserModal").modal("show");
}

jt.createUser = function() {
    var id = $('#create-user-input').val();
    var type = $('#create-user-type').val();
    if (id.length > 0) {
        jt.socket.emit('createUser', {id: id, type: type});
        $("#createUserModal").modal("hide");
    }
}
