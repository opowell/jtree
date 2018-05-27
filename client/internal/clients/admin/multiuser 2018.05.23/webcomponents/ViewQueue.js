class ViewQueue extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <div id='view-queue' class='view hidden'>
          <h2 id='view-queue-displayName'></h2>

          <div class="btn-group mb-3">
                <button class="btn btn-primary btn-sm" onclick='jt.startSessionFromQueue()'>
                    <i class="fa fa-play"></i>&nbsp;&nbsp;Start session
                </button>
                <button class="btn btn-outline-primary btn-sm" onclick='jt.saveQueue()'>
                    <i class="fa fa-save"></i>&nbsp;&nbsp;Save
                </button>
              <button class="btn btn-outline-secondary btn-sm" onclick='jt.deleteQueueConfirm()'>
                  <i class="fa fa-trash"></i>&nbsp;&nbsp;Delete
              </button>
          </div>

          <div>Id</div>
          <div>Location</div>

          <h6 id='view-queue-id'></h6>

            <div class="form-group row">
               <div class='col-sm-2 col-form-label'>
                   <label id='view-queue-apps-title'>Apps</label>
                   <button class='btn btn-outline-primary btn-sm' onclick='jt.showAddAppToQueueModal();'>
                       <i class="fa fa-plus"></i>&nbsp;&nbsp;add...
                   </button>
               </div>

              <div class="col-sm-10">
                  <table class='table'>
                      <thead>
                          <tr>
                              <th></th>
                              <th>id</th>
                              <th>name</th>
                              <th>options</th>
                          </tr>
                      </thead>
                      <tbody id='queue-apps-table'></tbody>
                  </table>
              </div>
            </div>
      </div>
      `;
    }
}

jt.openQueue = function(queue) {
    setView('queue');

    $('#view-queue-displayName').text(queue.displayName);
    $('#view-queue-id').text(queue.id);
    $('#queue-apps-table').empty();
    for (var i in queue.apps) {
        jt.viewQueueShowApp(queue.apps[i], queue.id);
    }

}

jt.saveQueueAppOptions = function() {
    console.log('save queue app options');
}

jt.showAddAppToQueueModal = function() {
    $('#addAppToQueueModal').modal('show');
    $('#addAppToQueueModal-apps').empty();
    for (var i in jt.data.appInfos) {
        var app = jt.data.appInfos[i];
        var row = jt.AppRow(app, {}, ['id', 'name', 'description']).css('cursor', 'pointer');
        row.click(function(ev) {
            if ($(ev.target).prop('tagName') !== 'SELECT') {
                var optionEls = $(this).find('[app-option-name]');
                var options = jt.deriveAppOptions(optionEls);
                server.queueAddApp($(this).data('appId'), options);
            }
        });
        $('#addAppToQueueModal-apps').append(row);
    }
}

jt.viewQueueShowApp = function(queueApp, qId) {
    var appId = queueApp.appId;
    var options = queueApp.options;
    var app = jt.app(appId);
    app.indexInQueue = queueApp.indexInQueue;
    var div = jt.AppRow(app, options, ['#', 'id', 'optionsView']);
    div.attr('appIndex', app.indexInQueue);
    div.attr('appId', app.appId);
    $('#queue-apps-table').append(div);
    var actionsDiv = $('<div class="btn-group">');
    var deleteBtn = jt.DeleteButton();
    var copyBtn = jt.CopyButton();
    copyBtn.click(function() {
        server.queueAddApp(appId, options);
    });
    actionsDiv.append(copyBtn);
    deleteBtn.click(function(ev) {
        ev.stopPropagation();
        var appIndex = $(ev.target).parents('[appIndex]').attr('appIndex');
        var appId = $(ev.target).parents('[appId]').attr('appId');
        jt.confirm(
            'Are you sure you want to delete App #' + appIndex + ' - ' + appId + ' from Queue ' + qId + '?',
            function() {
                jt.socket.emit('deleteAppFromQueue', {qId: qId, aId: appId, appIndex: appIndex});
            }
        );
    });
    actionsDiv.append(deleteBtn);
    div.prepend(actionsDiv);
    div.click(function() {
        jt.setEditAppOptionsData(app, options, 'jt.saveQueueAppOptions()');
        $('#editAppOptionsModal').modal('show');
    });
}

window.customElements.define('view-queue', ViewQueue);
