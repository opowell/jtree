<template>
    <div>
        <b-button-group class="view-buttons">
            <b-button variant="outline-secondary" size="sm" onclick='jt.startSessionWithApp()'>
                <font-awesome-icon :icon="['fas', 'play']"/>&nbsp;&nbsp;Start session
            </b-button>
            <b-button variant="outline-secondary" size="sm" onclick='jt.appEdit()'>
                <font-awesome-icon :icon="['fas', 'edit']"/>&nbsp;&nbsp;Edit...
            </b-button>
            <b-button variant="outline-secondary" size="sm" onclick='jt.appRename()'>
                &nbsp;&nbsp;Rename / Move...
            </b-button>
            <b-button variant="outline-secondary" size="sm" onclick='jt.deleteApp()'>
                <font-awesome-icon :icon="['fas', 'trash']"/>&nbsp;&nbsp;Delete...
            </b-button>
        </b-button-group>

        <div id='view-app-edit' class='subview app-tab hidden'>
            <div class="btn-group">
                <button type="submit" class="btn btn-sm btn-outline-primary" onclick='jt.saveAppAndView();'>
                    <i class="fa fa-save"></i>&nbsp;Save and view
                </button>
                <button type="submit" class="btn btn-outline-secondary btn-sm" onclick='jt.saveApp();'>
                    <i class="fa fa-save"></i>&nbsp;Save
                </button>
                <button type="submit" class="btn btn-outline-secondary btn-sm" onclick='setView("app")'>
                    <i class="fa fa-times"></i>&nbsp;Cancel
                </button>
            </div>

            <div class="form-group row">
                <label for="edit-app-id" class="col-sm-2 col-form-label">Id</label>
                <div class="col-sm-10">
                    <input type="text" style='max-width: 20rem;' class="form-control" id="edit-app-id" placeholder="Id">
                </div>
            </div>
        </div>
        <view-app-preview></view-app-preview>
    </div>
</template>

<script>
// import AppPreview from '@/components/AppPreview.vue'
import 'bootstrap-vue'
import '@/webcomps/ViewAppPreview.js'

export default {
  name: 'ViewApp',
  props: [
    'dat',
    'panel',
  ],
//   components: {
//       AppPreview,
//   },
  data() {
    return {
        app: this.$store.state.app
    }
  },
  mounted() {
      this.panel.id = this.app.shortId;
  },
}

import jt from '@/webcomps/jtree.js'
import 'jquery'
import store from '@/store.js'

let $ = window.jQuery;

jt.resizeIFrameToFitContent = function(iframe) {
    $(iframe).prop('height', null);
    iframe.height = iframe.contentWindow.document.documentElement.offsetHeight + 36;
    console.log('setting size to ' + iframe.width + ' / ' + iframe.height);
}

jt.appShowOptions = function() {
    // eslint-disable-next-line no-undef
    jt.setEditAppOptionsData(appDefn, options, 'jt.saveSessionAppOptions()');
    window.vue.$bvModal.show('editAppOptionsModal');
}

jt.openApp = function(appId) {
    $('.modal').modal('hide');
    var app = jt.app(appId);

    jt.editor.reset();
    jt.editor.addFile(app.id, app.appjs, 'ace/mode/javascript');

    jt.editor.selectFile(app.id);

    jt.setEditAppOptionsData(app, app.options, jt.updateAppPreview);

    window.vue.$store.commit('setApp', app);

    jt.updateAppPreview();

    $('#view-app-tree').empty();

    let windowData = {
        panels: [
            { 
                id: "App",
                type: "ViewApp"
            }, 
        ],
    };

    store.dispatch('showWindow', windowData);
}

jt.appRename = function() {
    let appId = store.state.app.id;
    $('#rename-app-input').val(appId);
    // window.vue.$bvModal.show('renameAppModal');
    $('#renameAppModal').modal('show');
    $('#rename-app-input').focus();
}

jt.appEdit = function() {
    $('#viewAppEditTitle').text(store.state.app.id);
// window.vue.$bvModal.show('editAppModal');
    $('#editAppModal').modal().show();
}

jt.deleteApp = function() {
    var appId = $('#view-app-fullId').text();
    jt.confirm(
        'Are you sure you want to delete App ' + appId + '?',
        function() {
            jt.addLog('Deleting App ' + appId + '.');
            let cb = function() {
                jt.addLog('FINISHED: Deleting App ' + appId + '.');
            }
            jt.socket.emit('deleteApp', appId, cb);
            jt.setView('apps');
        }
    );
}

jt.saveApp = function() {
    var app = {};
    app.origId = $('#view-app-fullId').text();
    app.id = $('#edit-app-id').val();
    var editor = window.ace.edit("edit-app-appjs");
    app.appjs = editor.getValue();

    var editorCH = window.ace.edit("edit-app-clienthtml");
    app.clientHTML = editorCH.getValue();

    jt.socket.emit('saveApp', app);

}

jt.saveAppAndView = function() {
    jt.saveApp();
    jt.setView('app');
}

</script>