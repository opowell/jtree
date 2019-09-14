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
  var appId = $('#view-app-fullId').text();
  var app = jt.app(appId);

  let replaced = false;

  var name = $('#editVarName').text();
  var newValue = $('#appSetVariable-newVal').val();
  let curValue = $('#appSetVariable-curVal').text();
  let curString = name + ' = ' + curValue;
  let newString = name + ' = ' + newValue;
  if (app.appjs.includes(curString)) {
    app.appjs = app.appjs.replace(curString, newString);
    replaced = true;
  }

  if (!replaced) {
      if (app.appjs.includes(curValue)) {
        app.appjs = app.appjs.replace(curValue, newValue);
          replaced = true;
      }
  }

  if (!replaced) {
    app.appjs = app.appjs + '\napp.' + name + ' = ' + newValue + ';';
      replaced = true;
  }

  let fn = $('.filename.file-selected').text();
  jt.appSaveFileContents(fn, app.appjs);
  $('#appSetVariableModal').modal('hide');
}

window.customElements.define('appsetvariable-modal', AppSetVariableModal);
