class ViewQueues extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <div id='view-queues' class='view hidden'>
          <h2>Queues</h2>
          <div class="input-group mb-3">
            <a href='#' class='btn btn-sm btn-outline-secondary btn-sm' onclick='jt.showCreateQueueModal();'>
                <i class="fa fa-plus"></i>&nbsp;&nbsp;create...
            </a>
          </div>
          <div id='queues-table'>
              <b-table hover
                :items="queues"
                :fields='fields'
                @row-clicked='openQueue'
                tbody-tr-class='clickable'
              >
                <template slot="appslist" slot-scope="data">
                    <div>
                        {{data.item.apps.length}}
                    </div>
                </template>
                <template slot="options" slot-scope="data">
                    <div v-for='opt in data.item.options'>
                        {{opt.name}}: {{curVal(opt, data.item, data.item.optionValues)}}
                    </div>
                </template>
                <template slot="actions" slot-scope="data">
                    <button class="btn btn-outline-primary btn-sm" @click.stop @click='startSessionFromQueue(data.item.id)'>
                        <i class="fa fa-play" title="start new session with this queue"></i>
                    </button>
                </template>
              </b-table>
          </div>
      </div>
      `;
    }
}

jt.showCreateQueueModal = function() {
    $("#createQueueModal").modal("show");
}

showQueues = function() {
    new Vue({
        el: '#queues-table',
        data: {
            queues: jt.data.queues,
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
                },
                {
                    key: 'options',
                    label: 'options',
                }
            ],
        },
        methods: {
            openQueue(item, index, event) {
                jt.openQueue(item);
            },
            deleteQueueConfirm(id) {
                jt.deleteQueueConfirm(id);
            },
            startSessionFromQueue(id) {
                server.startSessionFromQueue(id);
            },
            curVal(opt, obj, optionVals) {
                var selected = undefined;
                if (opt.values !== undefined) {
                    selected = opt.values[0];
                }
                if (opt.defaultVal !== undefined) {
                    selected = opt.defaultVal;
                }
                if (obj[opt.name] !== undefined) {
                    selected = obj[option.name];
                }
                if (optionVals !== undefined && optionVals[opt.name] !== undefined) {
                    selected = optionVals[opt.name];
                }
                return selected;
            },
        },
      });
}

jt.startSessionFromQueue = function(id) {
    if (id === undefined) {
        id = $('#view-queue-id').text();
    }
    server.startSessionFromQueue(id, {});
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