class RenameAppModal extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <div class="modal" id="renameAppModal" tabindex="-1" role="dialog">
          <div class="modal-dialog" role="document" style='max-width: 800px;'>
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title">Rename / Move App</h5>
                      <button type="button" class="close" data-dismiss="modal">
                          <span>&times;</span>
                      </button>
                  </div>
                  <div class="modal-body">
                      Enter new filename for app: <input type="text" class="form-control" placeholder="Filename" id='rename-app-input' name='feaojfweaofijw22' style='flex: 0 0 150px' onkeyup='jt.renameAppModalKeyUp(event);'>
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-sm btn-outline-primary" onclick='jt.renameApp();'>Rename / Move</button>
                  </div>
              </div>
          </div>
      </div>
      `;
    }
}

window.customElements.define('renameapp-modal', RenameAppModal);

import jt from '@/webcomps/jtree.js'
import 'jquery'
let $ = window.jQuery
import server from '@/webcomps/msgsToServer.js'
import store from '@/store.js'

jt.renameAppModalKeyUp = function(e) {
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code == 13) { //Enter keycode
        jt.renameApp();
    }
}

jt.renameApp = function() {
    var newId = $('#rename-app-input').val();
    let originalId = store.state.app.id;
    
    // No change
    if (newId === originalId) {
        return;
    }


    let cb = function() {
        let appInfos = store.state.appInfos;
        for (let i=0; i<appInfos.length; i++) {
            let app = appInfos[i];
            if (app.id === originalId) {
                app.id = newId;
                let sep = '\\';
                let lastFolderChar = newId.lastIndexOf(sep);
                let lastPeriodChar = newId.lastIndexOf('.');
                app.shortId = newId.substring(lastFolderChar+1, lastPeriodChar);
                jt.addLog('Change app filename from "' + originalId + '" to "' + newId + '".');
                if (store.state.app.id === originalId) {
                    store.state.app.id = newId;
                    store.state.appPath = newId;
                }
                return;
            }
        }
    }

    if (newId.length > 0) {
        server.renameApp(originalId, newId, cb);
        $("#renameAppModal").modal("hide");
    }
}
