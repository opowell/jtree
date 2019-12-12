class ViewApps extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <div id='view-apps' class='view hidden'>
          <h2>Apps</h2>
          <span style='display: flex;' class='mb-2'>
            <a href='#' class='btn btn-sm btn-outline-secondary btn-sm' onclick='jt.showCreateAppModal();'>
                <i class="fa fa-plus"></i>&nbsp;&nbsp;create...
            </a>
            <a id='reloadAppsBtn' href='#' class='btn btn-sm btn-outline-secondary btn-sm' onclick='jt.reloadApps();'>
                <i class="fas fa-redo-alt"></i>&nbsp;&nbsp;reload
            </a>
          </span>

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

jt.reloadApps = function() {
    jt.disableButton('reloadAppsBtn', '<i class="fas fa-redo-alt"></i>&nbsp;&nbsp;reloading...');
    $('#appInfos').empty();
    jt.socket.emit("reloadApps", {});
}

function showAppInfos() {
    var appInfos = jt.data.appInfos;
    jt.enableButton('reloadAppsBtn', '<i class="fas fa-redo-alt"></i>&nbsp;&nbsp;reload');
    $('#appInfos').empty();
    for (var a in appInfos) {
        var app = appInfos[a];
        if (!app.isStandaloneApp) {
            continue;
        }
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
        if (app.hasError) {
            var errorMsg = $(`<div style='color: red'>
            <i class="fas fa-exclamation-triangle"></i>&nbsp;&nbsp;Error<br>
            <small style='white-space: normal' class='text-muted'>line ${app.errorLine}, pos ${app.errorPosition}</small>
            </div>`);
            actionDiv.append(errorMsg);    
        } else {
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
        }

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
