class ViewApps extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <div id='view-apps' class='view hidden'>
          <h2>Apps</h2>
          <span style='display: flex' class='mb-3'>
              <span class="input-group" style='width: auto;'>
                <input type="text" class="form-control" placeholder="App id" id='create-app-input' style='flex: 0 0 150px'>
                <div class="input-group-append">
                    <a href='#' class='btn btn-outline-primary btn-sm input-group-text' onclick='jt.createApp();'>
                        <i class="fa fa-plus"></i>&nbsp;&nbsp;create
                    </a>
                </div>
            </span>
            <a href='#' class='btn btn-outline-primary btn-sm input-group-text' onclick='jt.socket.emit("reloadApps", {});'>
                <i class="fa fa-repeat"></i>&nbsp;&nbsp;reload
            </a>
          </span>
              <div class='mr-2' style='display: flex;'>
                  <div style='padding: 0.5rem 0.1rem; margin: 2px 1px'>Queue:</div>
                  <div id='view-apps-queue' style='display: flex;'></div>
              </div>

          <table class='table table-hover' style='width: 100% !important;'>
              <thead>
                  <tr>
                      <th></th>
                      <th>id</th>
                      <th>description</th>
                  </tr>
              </thead>
              <tbody id='appInfos'>
              </tbody>
          </table>
      </div>
      `;
    }
}

jt.createApp = function() {
    var appId = $('#create-app-input').val();
    jt.socket.emit('createApp', appId);
}

function showAppInfos() {
    var appInfos = jt.data.appInfos;
    $('#appInfos').empty();
    for (var a in appInfos) {
        var app = appInfos[a];
        var row = jt.AppRow(app, {}, ['id', 'description']);
        row.click(function(ev) {
            if (
                ($(ev.target).prop('tagName') !== 'SELECT') &&
                ($(ev.target).prop('tagName') !== 'INPUT') &&
                ($(ev.target).prop('tagName') !== 'A')
            ) {
                jt.openApp($(this).data('appId'));
            }
        });
        row.css('cursor', 'pointer');
        
        row.data('appId', app.id);
        row.attr('appId', app.id);
        
        row.data('appShortId', app.shortId);

        var actionDiv = $('<div class="btn-group">');
        var createSessionBtn = $(`
        <button class="btn btn-outline-primary btn-sm">
            <i class="fa fa-play" title="start new session with this app"></i>
        </button>`);

        createSessionBtn.click(function(ev) {
            ev.stopPropagation();
            var optionEls = $(this).parents('tr').find('[app-option-name]');
            var options = jt.deriveAppOptions(optionEls);
            server.createSessionAndAddApp($(this).parents('tr').data('appId'), options);
        });
        actionDiv.append(createSessionBtn);

        // var dropdown = $(`<button type="button" class="btn btn-primary btn-sm dropdown-toggle dropdown-toggle-split" data-toggle="dropdown"><span class="sr-only">Toggle Dropdown</span></button>`);
        // actionDiv.append(dropdown);
        //
        // $(dropdown).click(function(ev) {
        //     ev.stopPropagation();
        //     $(ev.target).next().toggle();
        // });
        //
        // var ddMenu = $('<div class="dropdown-menu">');
        // var addToQueueBtn = $(`<button class="dropdown-item btn btn-sm btn-outline-primary">
        var addToQueueBtn = $(`<button class="btn btn-sm btn-outline-secondary">
            <i class="fa fa-plus" title="add to queue"></i>
        </button>`);
        addToQueueBtn.click(function(ev) {
            ev.stopPropagation();
            var appId = $(ev.target).parents('tr').attr('appId');
            jt.addAppToNewSessionQueue(appId);
        });
        // ddMenu.append(addToQueueBtn);
        actionDiv.append(addToQueueBtn);

        var delBtn = jt.DeleteButton();
        // delBtn.addClass('dropdown-item');
        delBtn.click(function(ev) {
            ev.stopPropagation();
            var appId = $(ev.target).parents('tr').attr('appId');
            jt.confirm(
                'Are you sure you want to delete App ' + appId + '?',
                function() {
                    jt.socket.emit('deleteApp', appId);
                }
            );
        });
        // ddMenu.append(delBtn);
        // actionDiv.append(ddMenu);
        actionDiv.append(delBtn);

        row.prepend($('<td>').append(actionDiv));

        $('#appInfos').append(row);
    }
}

function addAppToSessionAndStart(event) {
    event.stopPropagation();
    console.log('add app to session and start: ' + event.data.id + ', name = ' + event.data.name);
    server.addAppToSessionAndStart(event.data.id);
    setPage('participants');
}

jt.startSessionWithApp = function() {
    var appId = $('#view-app-fullId').text();
    var optionEls = $('#view-app [app-option-name]');
    var options = jt.deriveAppOptions(optionEls);
    server.createSessionAndAddApp(appId, options);
}

window.customElements.define('view-apps', ViewApps);
