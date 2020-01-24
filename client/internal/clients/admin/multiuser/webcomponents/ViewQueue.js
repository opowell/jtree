{/* <button class="btn btn-outline-primary btn-sm" onclick='jt.saveQueue()'>
<i class="fa fa-save"></i>&nbsp;&nbsp;Save
</button>
<button class="btn btn-outline-secondary btn-sm" onclick='jt.deleteQueueConfirm()'>
<i class="fa fa-trash"></i>&nbsp;&nbsp;Delete
</button> */}

class ViewQueue extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
<div id='view-queue' class='view hidden'>
    <h2 id='view-queue-displayName'></h2>
    <small id='view-queue-id'></small>
    <br><br>

    <div class="btn-group mb-3">
        <button class="btn btn-primary btn-sm" onclick='jt.startSessionFromQueueWithOptions()'>
            <i class="fa fa-play"></i>&nbsp;&nbsp;Start session
        </button>
    </div>

    <h6>Options</h6>

    <div class='tab-grid mt-3 mb-3' id='queue-options'></div>

    <div class='col-form-label'>
        <h6 id='view-queue-apps-title'>Apps</h6>
        <button class='btn btn-outline-primary btn-sm' onclick='jt.showAddAppToQueueModal();'>
            <i class="fa fa-plus"></i>&nbsp;&nbsp;add...
        </button>
    </div>

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
        `;
    }
}

jt.startSessionFromQueueWithOptions = function() {
    let id = $('#view-queue-id').text();
    let opts = {};
    let els = $('.view-app-option');
    for (let i=0; i<els.length; i++) {
        let el = els[i];
        let name = $(el).attr('app-option-name');
        let val = $('#view-app-option-' + name).val();
        opts[name] = val;
    }
    server.startSessionFromQueue(id, opts);
}

showQueueOptions = function() {
    let optionsEl = $('#queue-options');
    let queue = jt.data.queue;
    optionsEl.empty();
    for (let i in queue.options) {
        let option = queue.options[i];
        let nameDiv = $('<div></div>');
        let input = new EditOptionDivInput(queue.options[i], queue, queue.optionValues);
        nameDiv.append($('<div>').text(option.name + ': ' + input.val()));
        nameDiv.append($(`<small class="form-text text-muted">${option.description}</small>`));
        optionsEl.append(nameDiv);
        let div = $('<span style="display: flex; align-items: flex-start">');
        div.append(input);
        let el = $(`<button type='button' class='btn btn-primary btn-sm' onclick='jt.setQueueOption("${option.name}");'>Set</button>`);
        div.append(el);
        optionsEl.append(div);
    }
}

jt.openQueue = function(queue) {
    
    jt.data.queue = queue;

    showQueueOptions();
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

jt.setQueueOption = function(name) {
    let el = $('[app-option-name="' + name + '"]');
    let val = $('[app-option-name="' + name + '"]').val();
    if (el.attr('min') && val < el.attr('min')) {
        jt.popupMessage('Invalid queue option: ' + name + ' = ' + val);
        return;
    }
    if (el.attr('max') && val > el.attr('max')) {
        jt.popupMessage('Invalid queue option: ' + name + ' = ' + val);
        return;
    }
    jt.popupMessage('Set queue option: ' + name + ' = ' + val);
    jt.data.queue.optionValues[name] = val;
    showQueueOptions();
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
    var actionsDiv = $('<td class="btn-group">');
    var deleteBtn = jt.DeleteButton();
    // var copyBtn = jt.CopyButton();
    // copyBtn.click(function() {
    //     server.queueAddApp(appId, options);
    // });
    // actionsDiv.append(copyBtn);
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
