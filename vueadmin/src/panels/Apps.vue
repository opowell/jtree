<template>
  <div style='flex: 1 1 auto; align-self: stretch; overflow: auto;'>
      <span style='display: flex;' class='mb-2'>
        <b-button variant="outline-secondary" size="sm" onclick='jt.showCreateAppModal()'>
            <font-awesome-icon :icon="['fas', 'plus']"/>&nbsp;&nbsp;create...
        </b-button>
        <b-button variant="outline-secondary" size="sm" id='reloadAppsBtn' onclick='jt.reloadApps();'>
            <font-awesome-icon :icon="['fas', 'redo-alt']"/>&nbsp;&nbsp;reload
        </b-button>
      </span>

      <table class='table table-hover' style='width: 100% !important;'>
          <thead>
              <tr>
                  <th></th>
                  <th>id</th>
                  <th>description</th>
              </tr>
          </thead>
          <tbody>
              <AppRow 
                v-for='app in apps'
                :key='app.id'
                :fields='["playButton", "id", "description"]'
                :app='app'
                @click.native="clickApp(app.id, $event)"
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
import AppRow from '@/components/AppRow.vue'

export default {
  name: 'ViewApps',
  components: {
      AppRow,
  },
  props: [
    'dat',
    'panel',
  ],
  data() {
    return {
        apps: this.$store.state.appInfos,
        jt,
    }
  },
  methods: {
      clickApp(id, ev) {
        if (
            ($(ev.target).prop('tagName') !== 'SELECT') &&
            ($(ev.target).prop('tagName') !== 'INPUT') &&
            ($(ev.target).prop('tagName') !== 'A')
        ) {
            jt.openApp(id);
        }
      }
  },
  mounted() {
      this.panel.id = 'Apps';
  },
}

jt.reloadApps = function() {
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
    window.vue.$bvModal.show("createAppModal");
    $('#create-app-input').focus();
}

jt.startSessionWithApp = function() {
    var appId = $('#view-app-fullId').text();
    var optionEls = $('#view-app [app-option-name]');
    var options = jt.deriveAppOptions(optionEls);
    server.createSessionAndAddApp(appId, options);
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
