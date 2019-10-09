<template>
  <div style='flex: 1 1 auto; align-self: stretch; overflow: auto;'>
      <span style='display: flex;' class='mb-2'>
        <b-button variant="outline-secondary" size="sm" onclick='server.sessionCreate()'>
            <font-awesome-icon :icon="['fas', 'plus']"/>&nbsp;&nbsp;Create
        </b-button>
        <b-button variant="outline-secondary" size="sm" id='reloadSessionsBtn' onclick='jt.reloadSessions();'>
            <font-awesome-icon :icon="['fas', 'redo-alt']"/>&nbsp;&nbsp;Reload
        </b-button>
      </span>

      <table class='table table-hover' style='width: 100% !important;'>
          <thead>
              <tr>
                  <th></th>
                  <th>Id</th>
                  <th>Participants</th>
                  <th>{{appName}}s</th>
              </tr>
          </thead>
          <tbody>
              <SessionRow 
                v-for='session in sessions'
                :key='session.id'
                :fields='["playButton", "id", "numParticipants", "numApps"]'
                :session='session'
                @click.native="click(session.id, $event)"
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
import flatted from 'flatted'

export default {
  name: 'ViewSessions',
  props: [
    'dat',
    'panel',
  ],
  data() {
    return {
        sessions: this.$store.state.sessions,
        jt,
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
            server.openSession({id: id, name: id});
        }
      }
  },
  mounted() {
      this.panel.id = 'Sessions';
  },
}

import axios from 'axios';
import store from '@/store.js';

jt.reloadSessions = function() {
    jt.disableButton('reloadSessionsBtn');
    jt.addLog('Reloading Sessions...');
    store.state.sessions.splice(0, store.state.sessions.length);
    axios
    .get('http://' + window.location.host + '/api/sessions')
    .then(response => {
        for (let i=0; i<response.data.length; i++) {
            store.state.sessions.push(flatted.parse(response.data[i]));
        }
        jt.enableButton('reloadSessionsBtn');
        jt.addLog('FINISHED: Reloading Sessions.');
    });
}

jt.reloadSessions2 = function() {
    let sessions = window.vue.$store.state.sessions;
    sessions.splice(0, sessions.length)
    jt.disableButton('reloadSessionsBtn');
    jt.addLog('Reloading Sessions...');
    let cb = function() {
        jt.enableButton('reloadSessionsBtn');
        jt.addLog('FINISHED: Reloading Sessions.');
    }
    jt.socket.emit("reloadSessions", null, cb);
}

jt.deleteSessionPrompt = function(sessionId) {
    jt.confirm(
        'Are you sure you want to delete Session ' + sessionId + '?',
        function() {
            jt.socket.emit('deleteSession', sessionId);
            jt.setView('sessions');
        }
    );
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
