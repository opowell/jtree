class ViewApp extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <div id='view-app' class='view hidden'>
          <h2 class='text-muted'>App: <span style='color: #000' id='view-app-id'></span></h2>
          <h6 id='view-app-fullId' class='text-muted'></h6>

          <div class="view-buttons btn-group">
          <button class="btn btn-outline-primary btn-sm" onclick='jt.startSessionWithApp()'>
              <i class="fa fa-play"></i>&nbsp;&nbsp;Start session
          </button>
      </div>

          <div class="view-buttons btn-group">
                <button class="btn btn-outline-secondary btn-sm" onclick='jt.appEdit()'>
                    <i class="fa fa-edit"></i>&nbsp;&nbsp;Edit...
                </button>
                <button class="btn btn-outline-secondary btn-sm" onclick='jt.appRename()'>
                    &nbsp;&nbsp;Rename / Move...
                </button>
            </div>

        <div class="view-buttons btn-group">
              <button class="btn btn-outline-danger btn-sm" onclick='jt.deleteApp()'>
                  <i class="fa fa-trash"></i>&nbsp;&nbsp;Delete...
              </button>
          </div>

          <div id='view-app-edit' class='subview app-tab hidden'>
              <div class="btn-group">
                  <button type="submit" class="btn btn-sm btn-outline-primary" onclick='jt.saveAppAndView();'>
                      <i class="fa fa-save"></i>&nbsp;Save and view
                  </button>
                  <button type="submit" class="btn btn-outline-secondary btn-sm" onclick='jt.saveApp();'>
                      <i class="fa fa-save"></i>&nbsp;Save
                  </button>
                  <button type="submit" class="btn btn-outline-secondary btn-sm" onclick='setView("app")'>
                      <i class="fa fa-times"></i>&nbsp;Cancel
                  </button>
              </div>

              <div class="form-group row">
                  <label for="edit-app-id" class="col-sm-2 col-form-label">Id</label>
                  <div class="col-sm-10">
                      <input type="text" style='max-width: 20rem;' class="form-control" id="edit-app-id" placeholder="Id">
                  </div>
              </div>

          </div>
          <view-app-preview></view-app-preview>
      </div>
      `;
    }
}

document.write('<script src="/admin/multiuser/webcomponents/ViewAppPreview.js"></script>');

jt.resizeIFrameToFitContent = function(iframe) {
    $(iframe).prop('height', null);
    iframe.height = iframe.contentWindow.document.documentElement.offsetHeight + 36;
    console.log('setting size to ' + iframe.width + ' / ' + iframe.height);
}

jt.appShowOptions = function() {
    jt.setEditAppOptionsData(appDefn, options, 'jt.saveSessionAppOptions()');
    $('#editAppOptionsModal').modal('show');
}

jt.openApp = function(appId) {
    var app = jt.app(appId);

    $('#edit-app-id').val(app.shortId);
    $('#view-app-id').text(app.shortId);
    $('#view-app-fullId').text(app.id);
    $('#view-app-appjs').text(app.appjs);
    $('#view-app-clienthtml').text(app.clientHTML);

    $('#editAppModal .modal-title').text(appId);

    jt.editor.reset();
    jt.editor.addFile(app.id, app.appjs, 'ace/mode/javascript');

    jt.editor.selectFile(app.id);

    jt.setEditAppOptionsData(app, app.options, jt.updateAppPreview);

    jt.updateAppPreview();

    $('#view-app-tree').empty();

    setView('app');
}

jt.appRename = function() {
    let appId = $('#view-app-fullId').text();
    $('#rename-app-input').val(appId);
    $('#renameAppModal').modal('show');
    $('#rename-app-input').focus();
}

jt.appEdit = function() {
    $('#editAppModal').modal('show');
}

jt.deleteApp = function() {
    var appId = $('#view-app-fullId').text();
    jt.confirm(
        'Are you sure you want to delete App ' + appId + '?',
        function() {
            jt.socket.emit('deleteApp', appId);
            setView('apps');
        }
    );
}

jt.saveApp = function() {
    var app = {};
    app.origId = $('#view-app-fullId').text();
    app.id = $('#edit-app-id').val();
    var editor = ace.edit("edit-app-appjs");
    app.appjs = editor.getValue();

    var editorCH = ace.edit("edit-app-clienthtml");
    app.clientHTML = editorCH.getValue();

    jt.socket.emit('saveApp', app);

}

jt.saveAppAndView = function() {
    jt.saveApp();
    setView('app');
}

window.customElements.define('view-app', ViewApp);
