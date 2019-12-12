class ViewSessionApps extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <!-- SESSION - APPS -->
        <div id='view-session-appqueue' class='session-tab hidden'>

            <div class='btn-group mb-3'>
                <button type='button' class='btn btn-outline-primary btn-sm' onclick='jt.showAddAppToSessionModal();'>
                    <i class="fa fa-plus"></i>&nbsp;&nbsp;add App...
                </button>
                <button type='button' class='btn btn-outline-primary btn-sm' onclick='jt.showAddQueueToSessionModal();'>
                    <i class="fa fa-plus"></i>&nbsp;&nbsp;add Queue...
                </button>
                <button type='button' class='btn btn-outline-primary btn-sm' onclick='jt.showAddQueueToSessionModal();'>
                    <i class="fa fa-save"></i>&nbsp;&nbsp;Save as new queue...
                </button>
            </div>

            <table class='table table-hover'>
                <thead>
                    <tr>
                        <th></th>
                        <th>#</th>
                        <th>id</th>
                        <th>options</th>
                    </tr>
                </thead>
                <tbody id='session-apps-table'></tbody>
            </table>
        </div>
    `;
    }
}

function updateSessionApps() {

    $('#session-apps-table').empty();
    if (jt.data.session !== null && jt.data.session !== undefined) {
        for (var a in jt.data.session.apps) {

            var sessionApp = jt.data.session.apps[a];

            var appId = sessionApp.id;
            var options = sessionApp.options;

            // TODO: Why is it necessary to load App, rather than use SessionApp?
            var appDefn = jt.app(appId);
            appDefn.index = sessionApp.indexInSession;
            for (var i in sessionApp.options) {
                var option = sessionApp.options[i].name;
                if (sessionApp[option] !== undefined) {
                    appDefn[option] = sessionApp[option];
                }
            }

            var div = jt.AppRow(appDefn, options, ['#', 'id', 'optionsView']);
            div.attr('appIndex', appDefn.index);
            div.attr('appId', appDefn.appId);
            div.data('app', appDefn);
            div.data('options', options);
            var actionsDiv = $('<div class="btn-group">');
            var deleteBtn = jt.DeleteButton();
            var copyBtn = jt.CopyButton();
            copyBtn.click(function() {
                server.sessionAddApp(appId, options);
            });
            actionsDiv.append(copyBtn);
            deleteBtn.click(function(ev) {
                ev.stopPropagation();
                var appIndex = $(ev.target).parents('[appIndex]').attr('appIndex');
                var appId = $(ev.target).parents('[appId]').attr('appId');
                jt.confirm(
                    'Are you sure you want to delete App #' + appIndex + ' - ' + appId + ' from Queue ' + qId + '?',
                    function() {
                        jt.socket.emit('sessionDeleteApp', {sId: sId, aId: appId, appIndex: appIndex});
                    }
                );
            });
            actionsDiv.append(deleteBtn);
            div.prepend($('<td>').append(actionsDiv));
            div.click(function(ev) {
                var tr = $(ev.target).parents('tr');
                var appDefn = tr.data('app');
                var options = tr.data('options');
                jt.setEditAppOptionsData(appDefn, options, 'jt.saveSessionAppOptions()');
                $('#editAppOptionsModal').modal('show');
            });

            $('#session-apps-table').append(div);
            $(div).css('cursor', 'pointer');
        }
    }
}

jt.showAddQueueToSessionModal = function() {
    $('#addQueueToSessionModal').modal('show');
    $('#addQueueToSessionModal-queues').empty();
    for (var i in jt.data.queues) {
        var queue = jt.data.queues[i];
        var row = jt.QueueRow(queue, ['id', 'apps']);
        row.css('cursor', 'pointer');
        row.data('queue', queue.id);

        row.click(function(ev) {
            server.sessionAddQueue($(this).data('queue'));
            $('#addQueueToSessionModal').modal('hide');
        });

        $('#addQueueToSessionModal-queues').append(row);
    }
}

jt.saveSessionAppOptions = function() {
    var optionEls = $('#editAppOptionsModal').find('[app-option-name]');
    var options = jt.deriveAppOptions(optionEls);
    var data = {};
    data.sId = jt.data.session.id;
    data.appId = $('#editAppOptionsModal').data('app').id;
    data.index = $('#editAppOptionsModal').data('app').index - 1;
    data.options = options;
    jt.socket.emit('setSessionAppOptions', data);
    $('#editAppOptionsModal').modal('hide');
    var sessionApp = jt.data.session.apps[data.index];
    for (var i in options) {
        sessionApp[i] = options[i];
    }
    updateSessionApps();
}

window.customElements.define('view-session-apps', ViewSessionApps);
