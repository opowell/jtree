class ViewAppEditorModal extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <div id='editAppModal' class="modal fullPageModal" tabindex="-1" role="dialog">
          <div style='max-width: 100%; height: 100%; margin: 0px' class="modal-dialog" role="document">
              <div class="modal-content" style="height: 100%; border-width: 0px; border-radius: 0px;">
                  <div class="modal-header">
                      <h5 class="modal-title"></h5>
                      <button type="button" class="ml-3 btn btn-sm btn-primary" onclick='jt.appSaveFileContentsFromEditor();'>Save</button>
                      <button type="button" class="close" data-dismiss="modal">
                          <span>&times;</span>
                      </button>
                  </div>
                  <div class="modal-body" style="padding: 0rem;">
<!--                      <div id="sidebar">
                        <div id="file-list"></div>
                        <a id="create-file-button" href="javascript:void(0);">&plus;</a>
                      </div>
    -->
                      <div id='app-editor' style='height: 100%; width: 100%;'></div>
                  </div>
              </div>
          </div>
      </div>
      `;
    }
}

// Ref: http://blog.codebender.cc/2015/09/25/developer-says-handling-multiple-sessions-with-ace-editor/
document.write('<link rel="stylesheet" type="text/css" href="/admin/multiuser/webcomponents/codeEditor/main.css">');
document.write('<script src="/admin/multiuser/webcomponents/codeEditor/editorUI.js"></script>');
document.write('<script src="/admin/multiuser/webcomponents/codeEditor/fileManager.js"></script>');
document.write('<script src="/admin/multiuser/webcomponents/codeEditor/editor.js"></script>');

jt.appSaveFileContentsFromEditor = function() {
    var editor = ace.edit("app-editor");
    var text = editor.getValue();
    var fn = $('.filename.file-selected').text();
    jt.appSaveFileContents(fn, text);
    $("#editAppModal").modal("hide");
}

jt.appSaveFileContents = function(filename, content) {
  var appId = $('#view-app-fullId').text();
  jt.socket.emit('appSaveFileContents', {filename: filename, aId: appId, content: content});
  var app = jt.app(appId);
  app.appjs = content;
  //   app.clientHTML = content;
  jt.openApp(appId);
}

window.customElements.define('viewappeditor-modal', ViewAppEditorModal);
