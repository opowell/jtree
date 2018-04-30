class EditAppOptionsModal extends HTMLElement {

    connectedCallback() {
      this.innerHTML = `
      <div class="modal" id="editAppOptionsModal" tabindex="-1" role="dialog">
          <div class="modal-dialog" role="document" style='max-width: 90%;'>
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title">Edit App Options</h5>
                      <button type="button" class="close" data-dismiss="modal">
                          <span>&times;</span>
                      </button>
                  </div>
                  <div class="modal-body">
                      <table class='table table-hover'>
                          <thead>
                              <tr>
                                  <th>name</th>
                                  <th>value</th>
                                  <th>description</th>
                              </tr>
                          </thead>
                          <tbody id='editAppOptionsModal-options'>
                          </tbody>
                      </table>
                  </div>
                  <div class="modal-footer">
                      <button type="button" id="editAppOptionsSaveBtn" class="btn btn-outline-primary">Save</button>
                      <button type="button" class="btn btn-outline-secondary" data-dismiss="modal">Cancel</button>
                  </div>
              </div>
          </div>
      </div>
      `;
    }
}

jt.setEditAppOptionsData = function(app, options, onSaveFunc) {
    $('#editAppOptionsModal .modal-title').text('Edit App Options: ' + app.id);
    $('#editAppOptionsModal-options').empty();
    $('#editAppOptionsModal').data('app', app);
    $('#editAppOptionsSaveBtn')[0].onclick = function() {
        eval(onSaveFunc);
    };
    for (var i in app.options) {
        var option = app.options[i];
        var div = AppOptionRow(option, app, options);
        $('#editAppOptionsModal-options').append(div);
    }
}

window.customElements.define('editappoptions-modal', EditAppOptionsModal);
