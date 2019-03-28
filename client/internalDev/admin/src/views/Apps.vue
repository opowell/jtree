<template>
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

          <div id='queues-table'>
              <b-table hover
                :items="apps"
                :fields='fields'
                @row-clicked='openApp'
                tbody-tr-class='clickable'
              >
                <template slot="actions" slot-scope="data">
                    <div class="btn-group">
        <button class="btn btn-outline-primary btn-sm" @click.stop='startNewSession(data.item.id)'>
            <i class="fa fa-play" title="start new session with this app"></i>
        </button>
        <delete-button @click.stop='deleteApp(data.item)'>
        </delete-button>
                    </div>
                </template>
              </b-table>
          </div>
      </div>
</template>

<script>
import DeleteButton from '@/components/DeleteButton.vue'
import jQuery from 'jquery';

export default {
  name: 'apps',
  components: {
      DeleteButton,
  },
  data() {
    return {
      apps: this.$store.state.apps,
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
              key: 'description',
              label: 'description',
              sortable: true,
          },
      ],
    }
  },
  methods: {
    openApp(item) {
       window.jt.openApp(item.appId);
    },
    deleteQueueConfirm(id) {
        window.jt.deleteQueueConfirm(id);
    },
    startSessionFromQueue(id) {
        window.server.startSessionFromQueue(id);
    },
    startNewSession(id) {
            var optionEls = jQuery(this).parents('tr').find('[app-option-name]');
            var options = window.jt.deriveAppOptions(optionEls);
            window.server.createSessionAndAddApp(id, options);
    },
    deleteApp(item) {
        var appId = item.appId;
        window.jt.confirm(
            'Are you sure you want to delete App ' + appId + '?',
            function() {
                window.jt.socket.emit('deleteApp', appId);
            }
        );
    }
  },
}

window.jt.createApp = function() {
    var appId = document.getElementById('create-app-input').value;
    window.jt.socket.emit('createApp', appId);
}

// function addAppToSessionAndStart(event) {
//     console.log('add app to session and start: ' + event.data.id + ', name = ' + event.data.name);
//     window.server.addAppToSessionAndStart(event.data.id);
//     window.setPage('participants');
// }

window.jt.startSessionWithApp = function() {
    var appId = document.getElementById('view-app-fullId').text;
    var optionEls = document.querySelectorAll('#view-app [app-option-name]');
    var options = window.jt.deriveAppOptions(optionEls);
    window.server.createSessionAndAddApp(appId, options);
}

</script>