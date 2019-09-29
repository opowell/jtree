<template>
  <div>
      <h2>Apps</h2>
      <span style='display: flex;' class='mb-2'>
        <a href='#' class='btn btn-sm btn-outline-secondary btn-sm' onclick='jt.showCreateAppModal()'>
            <i class="fa fa-plus"></i>&nbsp;&nbsp;create...
        </a>
        <a id='reloadAppsBtn' href='#' class='btn btn-sm btn-outline-secondary btn-sm' onclick='jt.reloadApps();'>
            <i class="fas fa-redo-alt"></i>&nbsp;&nbsp;reload
        </a>
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
  }
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
    $("#createAppModal").modal("show");
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
