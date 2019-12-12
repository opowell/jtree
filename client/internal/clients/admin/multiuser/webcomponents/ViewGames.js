class ViewQueues extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <div id='view-games' class='view hidden'>
          <h2>Games</h2>
          <div class="input-group mb-3">
            <input type="text" class="form-control" placeholder="Queue id" id='create-queue-input' style='flex: 0 0 150px'>
            <div class="input-group-append">
                <a href='#' class='btn btn-outline-primary btn-sm input-group-text' onclick='jt.createQueue();'>
                    <i class="fa fa-plus"></i>&nbsp;&nbsp;create
                </a>
            </div>
          </div>
          <div id='games-table'>
              <b-table hover
                :items="games"
                :fields='fields'
                @row-clicked='openGame'
                tbody-tr-class='clickable'
              >
                <template slot="appslist" slot-scope="data">
                    <div>
                        {{data.item.apps.length}}
                    </div>
                </template>
                <template slot="actions" slot-scope="data">
                    <div class="btn-group">
                        <button class="btn btn-outline-primary btn-sm" @click.stop @click='startSessionFromQueue(data.item.id)'>
                            <i class="fa fa-play" title="start new session with this queue"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" @click.stop @click='deleteQueueConfirm(data.item.id)'>
                            <i class="fa fa-trash" title="delete"></i>
                        </button>
                    </div>
                </template>
              </b-table>
          </div>
      </div>
      `;
    }
}

showQueues = function() {
    new Vue({
        el: '#games-table',
        data: {
            queues: jt.data.games,
            fields: [
                {
                    key: 'actions',
                    label: '',
                },
                {
                    key: 'displayName',
                    label: 'name',
                    sortable: true,
                },
                {
                    key: 'id',
                    label: 'id',
                    sortable: true,
                },
                {
                    key: 'appslist',
                    label: 'apps',
                }
            ],
        },
        methods: {
            openQueue(item, index, event) {
                jt.openQueue(item.id);
            },
            deleteQueueConfirm(id) {
                jt.deleteQueueConfirm(id);
            },
            startSessionFromQueue(id) {
                server.startSessionFromQueue(id);
            },
        },
      });
}

jt.createQueue = function() {
    var id = $('#create-queue-input').val().trim();
    if (id.length > 0) {
        server.createQueue(id);
    }
}

// jt.startSessionFromQueue = function(id) {
//     if (id === undefined) {
//         id = $('#view-queue-id').text();
//     }
//     server.startSessionFromQueue(id);
// }

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

window.customElements.define('view-games', ViewGames);