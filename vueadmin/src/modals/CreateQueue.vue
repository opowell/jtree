<template>
    <b-modal 
        id="createQueueModal"
        title="Create Queue"
    >
        Enter filename for new Queue: <br><br><input type="text" class="form-control" placeholder="Filename" id='create-queue-input' name='feaojfweaofijwfefew' onkeyup="jt.createQueueKeyUp(event)" style='flex: 0 0 150px'>
        <template v-slot:modal-footer="{ hide }">
            <button type="button" class="btn btn-sm btn-outline-primary" onclick='jt.createQueue();'>Create</button>
        </template>

      </b-modal>
</template>

<script>

import jt from '@/webcomps/jtree.js'
import 'jquery'
import server from '@/webcomps/msgsToServer.js'
let $ = window.jQuery;

export default {
  name: 'CreateQueue',
  data() {
    return {
        state: this.$store.state
    }
  },
}

jt.createQueueKeyUp = function(e) {
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code == 13) { //Enter keycode
        jt.createQueue();
    }
}

jt.createQueue = function() {
    var id = $('#create-queue-input').val();
    if (id.length > 0) {
        if (!id.includes('.')) {
            id = id + '.jtq';
        }

        let cb = function() {
            jt.addLog('Created queue = ' + id);
        }
    
        server.createQueue(id, cb);
        window.vue.$bvModal.hide("createQueueModal");
        $('#create-queue-input').val('');
    }
}

</script>