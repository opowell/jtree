class CreateAppModal extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <div class="modal" id="createAppModal" tabindex="-1" role="dialog">
          <div class="modal-dialog" role="document" style='max-width: 400px;'>
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title">Create App</h5>
                      <button type="button" class="close" data-dismiss="modal">
                          <span>&times;</span>
                      </button>
                  </div>
                  <div class="modal-body">
                      Enter filename for new app: <input type="text" class="form-control" placeholder="Filename" id='create-app-input' name='feaojfweaofijw' onkeyup="jt.execIfEnter(event, jt.createApp)" style='flex: 0 0 150px'>
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-sm btn-outline-primary" onclick='jt.createApp();'>Create</button>
                  </div>
              </div>
          </div>
      </div>
      `;
    }
}

window.customElements.define('createapp-modal', CreateAppModal);

jt.showCreateAppModal = function() {
    $("#createAppModal").modal("show");
    $('#create-app-input').focus();
}

jt.createApp = function() {
    var id = $('#create-app-input').val();
    if (id.length > 0) {
        if (!id.includes('.')) {
            id = id + '.jtt';
        }

        let cb = function() {
            jt.popupMessage('Created app = ' + id);
        }
    
        server.createApp(id, cb);
        $("#createAppModal").modal("hide");
        $('#create-app-input').val('');
    }
}
