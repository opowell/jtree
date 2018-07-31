class AppSetVariableModal extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <div class="modal" id="appSetVariableModal" tabindex="-1" role="dialog">
          <div class="modal-dialog" role="document" style='max-width: 400px;'>
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title">Edit variable: <span id='editVarName'></span></h5>
                      <button type="button" class="close" data-dismiss="modal">
                          <span>&times;</span>
                      </button>
                  </div>
                  <div class="modal-body">
                      <div>Current value:</div>
                      <div id='appSetVariable-curVal'></div>
                      <div>
                          New value:
                          <input id='appSetVariable-newVal' style='width: 100%;' type='text'>
                      </div>
                      <br>
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-primary" onclick='jt.appSetVariable();'>Set</button>
                      <button type="button" class="btn btn-outline-secondary" data-dismiss="modal">Close</button>
                  </div>
              </div>
          </div>
      </div>
      `;
    }
}

jt.appSetVariable = function() {
  var appId = $('#view-app-id').text();
  var app = jt.app(appId);
  var name = $('#editVarName').text();
  var value = $('#appSetVariable-newVal').val();
  var contents = app.appjs + '\napp.' + name + ' = ' + value + ';';
  jt.appSaveFileContents('app.js', contents);
  $('#appSetVariableModal').modal('hide');
}

window.customElements.define('appsetvariable-modal', AppSetVariableModal);
