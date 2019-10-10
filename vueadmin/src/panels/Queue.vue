<template>
      <div>

          <div class="btn-group mb-3">
                <button class="btn btn-outline-secondary btn-sm" onclick='server.startSessionFromQueue(vue.$store.state.queue.id)'>
                    <i class="fa fa-play"></i>&nbsp;&nbsp;Start session
                </button>
                <button class="btn btn-outline-secondary btn-sm" onclick='jt.saveQueue()'>
                    <i class="fa fa-save"></i>&nbsp;&nbsp;Save
                </button>
              <button class="btn btn-outline-secondary btn-sm" onclick='jt.deleteQueueConfirm()'>
                  <i class="fa fa-trash"></i>&nbsp;&nbsp;Delete
              </button>
          </div>

          <div class='mb-2'>Id: {{queue.id}}</div>

            <div class="form-group row">
               <div class='col-sm-2 col-form-label'>
                   <label id='view-queue-apps-title'>Apps</label>
                   <button class='btn btn-outline-primary btn-sm' onclick='jt.showAddAppToQueueModal();'>
                       <i class="fa fa-plus"></i>&nbsp;&nbsp;add...
                   </button>
               </div>

              <div class="col-sm-10">
                  <table class='table'>
                      <thead>
                          <tr>
                              <th>#</th>
                              <th>id</th>
                              <th>options</th>
                          </tr>
                      </thead>
                      <tbody>
                <AppRow 
                    v-for='(app, appIndex) in queue.apps'
                    :key='appIndex'
                    :fields='["indexInQueue", "id", "optionsView"]'
                    :app='app'
                    :options='app.options'
                    style='cursor: pointer;'
                  />
                    <!-- @click.native="clickApp(app.id, $event)" -->
                      </tbody>
                  </table>
              </div>
            </div>
      </div>
</template>

<script>

import 'jquery'
let $ = window.jQuery
import jt from '@/webcomps/jtree.js'
import server from '@/webcomps/msgsToServer.js'
import store from '@/store.js'

export default {
  name: 'ViewQueue',
  props: [
    'dat',
    'panel',
  ],
  data() {
    return {
        queue: this.$store.state.queue,
        jt,
    }
  },
  mounted() {
      this.panel.id = this.queue.displayName;
  },
}

jt.openQueue = function(queue) {

    let fullQueue = {};
    fullQueue.id = queue.id;
    fullQueue.displayName = queue.displayName;
    fullQueue.apps = [];
    for (let i in queue.apps) {
        let queueApp = queue.apps[i];
        let appId = queueApp.appId;
        let options = queueApp.options;
        let app = {};
        app.indexInQueue = queueApp.indexInQueue;
        app.id = appId;
        app.queueOptions = options;
        app.options = [];
        let fullApp = jt.app(appId);
        for (let i in fullApp.options) {
            let newOption = {};
            let prevOption = fullApp.options[i];
            for (let j in prevOption) {
                newOption[j] = prevOption[j];
            }
            app.options.push(newOption);
        }
        fullQueue.apps.push(app);
    }
    window.vue.$store.commit('setValue', {path: 'queue', value: fullQueue});

    let windowData = {
        panels: [
            { 
                id: "Queue",
                type: "ViewQueue"
            }, 
        ],
    };

    store.dispatch('showWindow', windowData);
}

jt.saveQueueAppOptions = function() {
    console.log('save queue app options');
}

jt.showAddAppToQueueModal = function() {
    $('#addAppToQueueModal').modal('show');
    $('#addAppToQueueModal-apps').empty();
    for (var i in jt.data.appInfos) {
        var app = jt.data.appInfos[i];
        var row = jt.AppRow(app, {}, ['id', 'name', 'description']).css('cursor', 'pointer');
        row.click(function(ev) {
            if ($(ev.target).prop('tagName') !== 'SELECT') {
                var optionEls = $(this).find('[app-option-name]');
                var options = jt.deriveAppOptions(optionEls);
                server.queueAddApp($(this).data('appId'), options);
            }
        });
        $('#addAppToQueueModal-apps').append(row);
    }
}

jt.viewQueueShowApp = function(queueApp, qId) {
    var appId = queueApp.appId;
    var options = queueApp.options;
    var app = jt.app(appId);
    app.indexInQueue = queueApp.indexInQueue;
    var div = jt.AppRow(app, options, ['#', 'id', 'optionsView']);
    div.attr('appIndex', app.indexInQueue);
    div.attr('appId', app.appId);
    $('#queue-apps-table').append(div);
    var actionsDiv = $('<div class="btn-group">');
    var deleteBtn = jt.DeleteButton();
    var copyBtn = jt.CopyButton();
    copyBtn.click(function() {
        server.queueAddApp(appId, options);
    });
    actionsDiv.append(copyBtn);
    deleteBtn.click(function(ev) {
        ev.stopPropagation();
        var appIndex = $(ev.target).parents('[appIndex]').attr('appIndex');
        var appId = $(ev.target).parents('[appId]').attr('appId');
        jt.confirm(
            'Are you sure you want to delete App #' + appIndex + ' - ' + appId + ' from Queue ' + qId + '?',
            function() {
                jt.socket.emit('deleteAppFromQueue', {qId: qId, aId: appId, appIndex: appIndex});
            }
        );
    });
    actionsDiv.append(deleteBtn);
    div.prepend(actionsDiv);
    div.click(function() {
        jt.setEditAppOptionsData(app, options, 'jt.saveQueueAppOptions()');
        $('#editAppOptionsModal').modal('show');
    });
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
