class RenameAppModal extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <div class="modal" id="renameAppModal" tabindex="-1" role="dialog">
          <div class="modal-dialog" role="document" style='max-width: 800px;'>
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title">Rename App</h5>
                      <button type="button" class="close" data-dismiss="modal">
                          <span>&times;</span>
                      </button>
                  </div>
                  <div class="modal-body">
                      Enter new filename for app: <input type="text" class="form-control" placeholder="Filename" id='rename-app-input' name='feaojfweaofijw22' style='flex: 0 0 150px' onkeyup='jt.renameAppModalKeyUp(event);'>
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-sm btn-outline-primary" onclick='jt.renameApp();'>Rename</button>
                  </div>
              </div>
          </div>
      </div>
      `;
    }
}

window.customElements.define('renameapp-modal', RenameAppModal);

jt.renameAppModalKeyUp = function(e) {
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code == 13) { //Enter keycode
        jt.renameApp();
    }
}

jt.renameApp = function() {
    var newId = $('#rename-app-input').val();
    
    // No change
    if (newId === $('#edit-app-id').val()) {
        return;
    }

    let originalId = $('#view-app-fullId').text();

    let cb = function() {
        jt.data.appInfos[newId] = jt.data.appInfos[originalId];
        delete jt.data.appInfos[originalId];
        jt.data.appInfos[newId].appPath = newId;
        jt.data.appInfos[newId].id = newId;
        let sep = '\\';
        let lastFolderChar = newId.lastIndexOf(sep);
        let lastPeriodChar = newId.lastIndexOf('.');
        jt.data.appInfos[newId].shortId = newId.substring(lastFolderChar+1, lastPeriodChar);
        jt.openApp(newId);
        jt.popupMessage('Set app filename = ' + newId);
        showAppInfos();
    }

    if (newId.length > 0) {
        server.renameApp(originalId, newId, cb);
        $("#renameAppModal").modal("hide");
    }
}
