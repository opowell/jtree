<template>
      <b-modal 
        id="addQueueToSessionModal" 
        tabindex="-1" 
        role="dialog"
        size='xl'
        title="Add Queue to Session"
        class='test'
        >
        <table class='table table-hover'>
            <thead>
                <tr>
                    <th></th>
                    <th>Name</th>
                    <th># {{appName}}s</th>
                </tr>
            </thead>
            <tbody>
              <QueueRow 
                v-for='queue in queues'
                :key='queue.id'
                :fields='["playButton", "id", "apps.length"]'
                :queue='queue'
                @click.native="click(queue, $event)"
                style='cursor: pointer;'
              />
          </tbody>
        </table>
        <template v-slot:modal-footer="{ hide }">
            <button type="button" class="btn btn-sm btn-outline-primary" @click='hide'>Close</button>
        </template>
      </b-modal>
</template>

<script>

import 'jquery'
let $ = window.jQuery
import jt from '@/webcomps/jtree.js'
import server from '@/webcomps/msgsToServer.js'

export default {
  name: 'ModalAddQueueToSession',
  data() {
    return {
        queues: this.$store.state.queues,
        appName: this.$store.state.appName,
    }
  },
    methods: {
        click(id, ev) {
        if (
            ($(ev.target).prop('tagName') !== 'SELECT') &&
            ($(ev.target).prop('tagName') !== 'INPUT') &&
            ($(ev.target).prop('tagName') !== 'A')
        ) {
            window.vue.$bvModal.hide('addQueueToSessionModal');
            server.sessionAddQueue(id);
        }
    }
  },

}

jt.showAddQueueToSessionModal = function() {
    window.vue.$bvModal.show('addQueueToSessionModal');
}

</script>