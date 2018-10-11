class ViewQueues extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <div id='view-queues' class='view hidden'>
          <h2>Queues</h2>
          <div class='card my-3'>
              <div class='card-body'>
                  <div class='card-text'>Queues are collections of apps, initialized with certain values. Useful when you need to run a particular sequence of apps, or have multiple variations of a single app.
                  </div>
              </div>
          </div>
          <div class="input-group mb-3">
            <input type="text" class="form-control" placeholder="Queue id" id='create-queue-input' style='flex: 0 0 150px'>
            <div class="input-group-append">
                <a href='#' class='btn btn-outline-primary btn-sm input-group-text' onclick='jt.createQueue();'>
                    <i class="fa fa-plus"></i>&nbsp;&nbsp;create
                </a>
            </div>
          </div>
          <table class='table table-hover'>
              <thead>
                  <tr>
                      <th></th>
                      <th>id</th>
                      <th>name</th>
                      <th>apps</th>
                  </tr>
              </thead>
              <tbody id='view-queues-table'>
              </tbody>
          </table>
      </div>
      `;
    }
}

function showQueues() {
    $('#view-queues-table').empty();
    for (var i in jt.data.queues) {
        var queue = jt.data.queues[i];
        showQueue(queue);
    }
}

function showQueue(queue) {

    var div = $('<tr queueId="' + queue.id + '" style="cursor: pointer">');
    try {
        div.append($('<td>').text(queue.id));
        div.append($('<td>').text(queue.displayName));
        var appsText = '';
        for (var i=0; i<queue.apps.length; i++) {
            var app = queue.apps[i];
            appsText += app.indexInQueue + ': ' + app.appId;
            // if (objLength(app.options) > 0) {
            //     appsText += '(';
            //     for (var j in app.options) {
            //         appsText += app.options[j] + ', ';
            //     }
            //     // remove last comma, replace with closing parenthesis
            //     appsText = appsText.substring(0, appsText.length - 2);
            //     appsText += ')';
            // }
            if (i < queue.apps.length - 1) {
                appsText += '<br>';
            }
        }
        div.append($('<td>').html(appsText));
        var que = queue;
        var qId = que.id;

        var actionDiv = $('<div class="btn-group">');
        var startBtn = $('<button class="btn btn-outline-primary btn-sm"><i class="fa fa-play" title="start new session with this queue"></i></button>');
        startBtn.click(function(ev) {
            ev.stopPropagation();
            server.startSessionFromQueue(qId);
        });
        actionDiv.append(startBtn);

        div.click(function() {
             jt.openQueue(que);
        });

        var deleteBtn = jt.DeleteButton();

        deleteBtn.click(function(ev) {
            ev.stopPropagation();
            jt.deleteQueueConfirm(qId);
        });
        actionDiv.append(deleteBtn);

        div.prepend($('<td>').append(actionDiv));

    } catch (err) {
    }

    $('#view-queues-table').append(div);
}

jt.createQueue = function() {
    var id = $('#create-queue-input').val().trim();
    if (id.length > 0) {
        server.createQueue(id);
    }
}

jt.startSessionFromQueue = function(id) {
    if (id === undefined) {
        id = $('#view-queue-id').text();
    }
    server.startSessionFromQueue(id);
}

jt.deleteQueueConfirm = function(id) {
    if (id === undefined) {
        id = $('#view-queue-id').text();
    }
    jt.confirm(
        'Are you sure you want to delete Queue ' + id + '?',
        function() {
            server.deleteQueue(id);
        }
    );

}

window.customElements.define('view-queues', ViewQueues);
