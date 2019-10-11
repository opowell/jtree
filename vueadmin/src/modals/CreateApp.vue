<template>
    <b-modal 
        id="createAppModal"
        style='max-width: 400px;'
        :title='"Create " + this.$store.state.appName'
    >
        Enter filename for new {{this.$store.state.appName}}: <br><br><input type="text" class="form-control" placeholder="Filename" id='create-app-input' name='feaojfweaofijw' onkeyup="jt.createAppKeyUp(event)" style='flex: 0 0 150px'>
        <template v-slot:modal-footer="{ hide }">
            <button type="button" class="btn btn-sm btn-outline-primary" onclick='jt.createApp();'>Create</button>
        </template>

      </b-modal>
</template>

<script>

import jt from '@/webcomps/jtree.js'
import 'jquery'
import server from '@/webcomps/msgsToServer.js'
let $ = window.jQuery;

export default {
  name: 'CreateApp',
  data() {
    return {
        state: this.$store.state
    }
  },
}

jt.createAppKeyUp = function(e) {
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code == 13) { //Enter keycode
        jt.createApp();
    }
}

jt.createApp = function() {
    var id = $('#create-app-input').val();
    if (id.length > 0) {
        if (!id.includes('.')) {
            id = id + '.jtt';
        }

        let cb = function() {
            jt.addLog('Created ' + this.$store.state.appName + ' = ' + id);
        }
    
        server.createApp(id, cb);
        window.vue.$bvModal.hide("createAppModal");
        $('#create-app-input').val('');
    }
}

</script>

<style>
.modal {
    padding-left: 10px !important;
    padding-right: 10px !important;
}
.modal-dialog.modal-xl {
    max-width: unset;
}
</style>