<template>
  <tr>
      <td v-for='(field, index) in fields' :key='index'>
          <template v-if='field == "id"'>
              <div>{{app.shortId}}</div>
              <div><small style="white-space: normal" class="text-muted">{{app.id}}</small></div>
          </template>
          <template v-else-if="field == 'description'">
              <div style='white-space: normal;' v-html="app.description"/>
          </template>
          <template v-else-if="field == 'playButton'">
            <div class="btn-group">
              <template v-if='app.hasError'>
                <div style='color: red'>
                  <i class="fas fa-exclamation-triangle"></i>&nbsp;&nbsp;Error<br>
                  <small style='white-space: normal' class='text-muted'>line ${app.errorLine}, pos ${app.errorPosition}</small>
                </div>              
              </template>
              <template v-else>
                <button @click.stop='clickPlayButton' class="btn btn-outline-secondary btn-sm">
                    <i class="fa fa-play" title="start new session with this app"></i>
                </button>
              </template>
            </div>
          </template>
      </td>
  </tr>
</template>

<script>
import 'jquery'
let $ = window.jQuery
import jt from '@/webcomps/jtree.js'
import server from '@/webcomps/msgsToServer.js'

export default {
  name: 'AppRow',
  props: {
    fields: Array,
    app: Object,
  },
  methods: {
    clickPlayButton() {
      var optionEls = $(this).parents('tr').find('[app-option-name]');
      var options = jt.deriveAppOptions(optionEls);
      server.createSessionAndAddApp(this.app.id, options);
    }
  }
}


</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
