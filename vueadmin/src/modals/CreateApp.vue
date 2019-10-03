<template>
      <div class="modal" id="createAppModal" tabindex="-1" role="dialog">
          <div class="modal-dialog" role="document" style='max-width: 400px;'>
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title">Create App</h5>
                      <button type="button" class="close" data-dismiss="modal">
                          <span>&times;</span>
                      </button>
                  </div>
                  <div class="modal-body">
                      Enter filename for new app: <br><br><input type="text" class="form-control" placeholder="Filename" id='create-app-input' name='feaojfweaofijw' onkeyup="jt.createAppKeyUp(event)" style='flex: 0 0 150px'>
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-sm btn-outline-primary" onclick='jt.createApp();'>Create</button>
                  </div>
              </div>
          </div>
      </div>
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
            jt.popupMessage('Created app = ' + id);
        }
    
        server.createApp(id, cb);
        $("#createAppModal").modal("hide");
        $('#create-app-input').val('');
    }
}

</script>