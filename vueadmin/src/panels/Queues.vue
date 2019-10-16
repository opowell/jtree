<template>
    <div style='flex: 1 1 auto; align-self: stretch; overflow: auto;'>
        <span style='display: flex;' class='mb-2'>
            <b-button variant="outline-secondary" size="sm" onclick='jt.showCreateQueueModal()'>
                <font-awesome-icon :icon="['fas', 'plus']"/>&nbsp;&nbsp;Create...
            </b-button>
            <b-button variant="outline-secondary" size="sm" onclick='jt.reloadQueues()'>
                <font-awesome-icon :icon="['fas', 'redo-alt']"/>&nbsp;&nbsp;Reload
            </b-button>
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

export default {
  name: 'ViewQueues',
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
    jt.disableButton('reloadQueuesBtn');
    jt.addLog('Reloading Queues...');
    let cb = function() {
        jt.enableButton('reloadQueuesBtn');
        jt.addLog('FINISHED: Reloading Queues.');
    }
    jt.socket.emit("reloadQueues", null, cb);
}

jt.showCreateQueueModal = function() {
    window.vue.$bvModal.show("createQueueModal");
    $('#create-queue-input').focus();
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
