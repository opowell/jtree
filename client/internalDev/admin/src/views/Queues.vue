<template>
      <div id='view-queues' class='view'>
          <h2>Queues</h2>
          <div class="input-group mb-3">
            <input type="text" class="form-control" placeholder="Queue id" id='create-queue-input' style='flex: 0 0 150px'>
            <div class="input-group-append">
                <a href='#' class='btn btn-outline-primary btn-sm input-group-text' onclick='jt.createQueue();'>
                    <i class="fa fa-plus"></i>&nbsp;&nbsp;create
                </a>
            </div>
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
                <template slot="actions" slot-scope="data">
                    <div class="btn-group">
                        <button class="btn btn-outline-primary btn-sm" @click.stop='startSessionFromQueue(data.item.id)'>
                            <i class="fa fa-play" title="start new session with this queue"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" @click.stop='deleteQueueConfirm(data.item.id)'>
                            <i class="fa fa-trash" title="delete"></i>
                        </button>
                    </div>
                </template>
              </b-table>
          </div>
      </div>
</template>

<script>

export default {
  name: 'queues',
  data() {
    return {
      queues: this.$store.state.queues,
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
    }
  },
  methods: {
    openQueue(item) {
        window.jt.openQueue(item.id);
    },
    deleteQueueConfirm(id) {
        window.jt.deleteQueueConfirm(id);
    },
    startSessionFromQueue(id) {
        window.server.startSessionFromQueue(id);
    },
  },
}

window.jt.createQueue = function() {
    var id = document.getElementById('create-queue-input').value.trim();
    if (id.length > 0) {
        window.server.createQueue(id);
    }
}

window.jt.startSessionFromQueue = function(id) {
    if (id === undefined) {
        id = document.getElementById('view-queue-id').text;
    }
    window.server.startSessionFromQueue(id);
}

window.jt.deleteQueueConfirm = function(id) {
    if (id === undefined) {
        id = document.getElementById('view-queue-id').text;
    }
    window.jt.confirm(
        'Are you sure you want to delete Queue ' + id + '?',
        function() {
            window.server.deleteQueue(id);
        }
    );

}

</script>