<template>
      <b-modal 
        id="openQueueModal" 
        tabindex="-1" 
        role="dialog"
        size='xl'
        title="Open Queue"
        class='test'
        >
        <table class='table table-hover'>
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

export default {
  name: 'ModalOpenQueue',
  data() {
    return {
        queues: this.$store.state.queues
    }
  },
    methods: {
        click(id, ev) {
        if (
            ($(ev.target).prop('tagName') !== 'SELECT') &&
            ($(ev.target).prop('tagName') !== 'INPUT') &&
            ($(ev.target).prop('tagName') !== 'A')
        ) {
            window.vue.$bvModal.hide('openQueueModal');
            jt.openQueue(id);
        }
    }
  },

}

jt.showOpenQueueModal = function() {
    window.vue.$bvModal.show('openQueueModal');
}

</script>