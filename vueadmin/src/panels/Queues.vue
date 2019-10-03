<template>
  <div style='flex: 1 1 auto; align-self: stretch; overflow: auto;'>
      <span style='display: flex;' class='mb-2'>
        <a href='#' class='btn btn-sm btn-outline-secondary btn-sm' onclick='jt.showCreateQueueModal()'>
            <i class="fa fa-plus"></i>&nbsp;&nbsp;create...
        </a>
        <a id='reloadQueuesBtn' href='#' class='btn btn-sm btn-outline-secondary btn-sm' onclick='jt.reloadQueues();'>
            <i class="fas fa-redo-alt"></i>&nbsp;&nbsp;reload
        </a>
      </span>

      <table class='table table-hover' style='width: 100% !important;'>
          <thead>
              <tr>
                  <th></th>
                  <th>name</th>
                  <th># apps</th>
              </tr>
          </thead>
          <tbody>
              <QueueRow 
                v-for='queue in queues'
                :key='queue.id'
                :fields='["playButton", "id", "apps.length"]'
                :queue='queue'
                @click.native="clickQueue(queue, $event)"
                style='cursor: pointer;'
              />
          </tbody>
      </table>
  </div>
</template>

<script>

import 'jquery'
let $ = window.jQuery
import jt from '@/webcomps/jtree.js'
import server from '@/webcomps/msgsToServer.js'
import QueueRow from '@/components/QueueRow.vue'

export default {
  name: 'ViewQueues',
  components: {
      QueueRow,
  },
  props: [
    'dat',
    'panel',
  ],
  data() {
    return {
        queues: this.$store.state.queues,
        jt,
    }
  },
  methods: {
      clickQueue(queue, ev) {
        if (
            ($(ev.target).prop('tagName') !== 'SELECT') &&
            ($(ev.target).prop('tagName') !== 'INPUT') &&
            ($(ev.target).prop('tagName') !== 'A')
        ) {
            jt.openQueue(queue);
        }
      }
  },
  mounted() {
      this.panel.id = 'Queues';
  },
}

jt.reloadQueues = function() {
    let appInfos = window.vue.$store.state.appInfos;
    appInfos.splice(0, appInfos.length)
    jt.disableButton('reloadAppsBtn');
    jt.addLog('Reloading Apps...');
    let cb = function() {
        jt.enableButton('reloadAppsBtn');
        jt.addLog('FINISHED: Reloading Apps.');
    }
    jt.socket.emit("reloadApps", null, cb);
}

jt.showCreateAppModal = function() {
    $("#createAppModal").modal("show");
    $('#create-app-input').focus();
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

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
