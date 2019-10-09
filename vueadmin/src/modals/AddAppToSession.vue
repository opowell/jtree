<template>
      <div class="modal" id="addAppToSessionModal" tabindex="-1" role="dialog">
          <div class="modal-dialog" role="document" style='max-width: 1000px'>
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title">Add App to Session</h5>
                      <button type="button" class="close" data-dismiss="modal">
                          <span>&times;</span>
                      </button>
                  </div>
                  <div class="modal-body">
                      <table class='table table-hover'>
            <thead>
                <tr>
                    <th>id</th>
                    <th>description</th>
                </tr>
            </thead>
            <tbody>
            <AppRow 
                v-for='app in apps'
                :key='app.id'
                :fields='["id", "description"]'
                :app='app'
                @click.native="click(app.id, $event)"
                style='cursor: pointer;'
            />
            </tbody>
                      </table>
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-outline-primary" data-dismiss="modal">Close</button>
                  </div>
              </div>
          </div>
      </div>
</template>

<script>

import 'jquery'
let $ = window.jQuery
import jt from '@/webcomps/jtree.js'
import server from '@/webcomps/msgsToServer.js'

export default {
  name: 'AddAppToSession',
  data() {
    return {
        apps: this.$store.state.appInfos
    }
  },
    methods: {
        click(id, ev) {
            if (
                ($(ev.target).prop('tagName') !== 'SELECT') &&
                ($(ev.target).prop('tagName') !== 'INPUT') &&
                ($(ev.target).prop('tagName') !== 'A')
            ) {
                window.vue.$bvModal.hide('addAppToSessionModal');
                var optionEls = $(this).find('[app-option-name]');
                var options = jt.deriveAppOptions(optionEls);
                server.sessionAddApp(id, options);
            }
        }
    }
}

</script>