<template>
      <div id='view-sessions' class='view hidden'>
          <h2>Sessions</h2>
          <a href='#' class='mb-2 btn btn-outline-primary btn-sm' onclick='window.server.sessionCreate();'>
              <i class="fa fa-plus"></i>&nbsp;&nbsp;new
          </a>
          <div id='queues-table'>
              <b-table hover
                :items="queues"
                :fields='fields'
                @row-clicked='open'
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
  name: 'sessions',
  data() {
    return {
      sessions: this.$store.state.sessions,
      fields: [
          {
              key: 'actions',
              label: '',
          },
          {
              key: 'id',
              label: 'id',
              sortable: true,
          },
          {
              key: 'participants',
              label: 'name',
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
    open(item) {
        window.server.openSession(item.id, item.id);
    },
    deleteQueueConfirm(id) {
        window.jt.deleteQueueConfirm(id);
    },
    startSessionFromQueue(id) {
        window.server.startSessionFromQueue(id);
    },
  },
}

</script>