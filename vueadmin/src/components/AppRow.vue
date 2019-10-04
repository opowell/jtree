<template>
  <tr :style='app.hasError ? "background-color: #ff000017" : ""'>
      <td v-for='(field, index) in fields' :key='index'>
          <template v-if='field == "id"'>
              <div>{{app.shortId}}</div>
              <div><small style="white-space: normal" class="text-muted">{{app.id}}</small></div>
          </template>
          <template v-else-if="field == 'optionsView'">
            <td>
              <div v-for='(option, index2) in options' :key='index2'>
                {{option.name}}: {{getOptionValue(option)}}
              </div>
            </td>
          </template>
          <template v-else-if="field == 'playButton'">
            <div class="btn-group">
              <template v-if='app.hasError'>
                <div style='color: red'>
                  <font-awesome-icon :icon="['fas', 'exclamation-triangle']"/><br>Error<br>
                  <small style='white-space: normal' class='text-muted'>line {{app.errorLine}}, pos {{app.errorPosition}}</small>
                </div>              
              </template>
              <template v-else>
                <button @click.stop='clickPlayButton' class="btn btn-outline-secondary btn-sm">
                    <font-awesome-icon :icon="['fa', 'play']" title="start new session with this app"/>
                </button>
              </template>
            </div>
          </template>
          <template v-else>
              <div style='white-space: normal;' v-html="getProp(app, field)"/>
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
    options: Array,
  },
  methods: {
    clickPlayButton() {
      var optionEls = $(this).parents('tr').find('[app-option-name]');
      var options = jt.deriveAppOptions(optionEls);
      server.createSessionAndAddApp(this.app.id, options);
    },
    getProp(app, field) {
      try {
        return eval('app.' + field);
      } catch {
        return '-';
      }
    },
    getOptionValue(option) {
      let selected = '-';
      if (option.values !== undefined) {
          selected = option.values[0];
      }
      if (option.defaultVal !== undefined) {
          selected = option.defaultVal;
      }
      if (this.app[option.name] !== undefined) {
          selected = this.app[option.name];
      }
      if (this.options !== undefined && this.options[option.name] !== undefined) {
          selected = this.options[option.name];
      }
      return selected;
    }
  }
}


</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
