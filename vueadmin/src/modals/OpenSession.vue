<template>
      <b-modal 
        id="openSessionModal" 
        tabindex="-1" 
        role="dialog"
        size='xl'
        title="Open Session"
        class='test'
        >
        <table class='table table-hover'>
            <thead>
                <tr>
                    <th>id</th>
                    <th>participants</th>
                    <th>{{appName}}s</th>
                </tr>
            </thead>
            <tbody>
            <SessionRow 
                v-for='session in sessions'
                :key='session.id'
                :fields='["id", "numParticipants", "numApps"]'
                :session='session'
                @click.native="click(session.id, $event)"
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
  name: 'ModalOpenSession',
  data() {
    return {
        sessions: this.$store.state.sessions,
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
            window.vue.$bvModal.hide('openSessionModal');
            jt.openApp(id);
        }
    }
  },

}

jt.showOpenSessionModal = function() {
    window.vue.$bvModal.show('openSessionModal');
}

</script>