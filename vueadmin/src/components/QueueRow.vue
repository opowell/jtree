<template>
  <tr :style='queue.hasError ? "background-color: #ff000017" : ""'>
      <td 
        v-for='(field, index) in fields'
        :key='index'
      >
          <template v-if='field == "id"'>
              <div>{{queue.displayName}}</div>
              <div><small style="white-space: normal" class="text-muted">{{queue.id}}</small></div>
          </template>
          <template v-else-if="field == 'apps'">
              <div v-for='(app, index2) in queue.apps' style='white-space: normal; word-break: break-all;' :key='index2'>
                {{appText(app)}}
                </div>
          </template>
          <template v-else-if="field == 'playButton'">
            <div class="btn-group">
              <template v-if='queue.hasError'>
                <div style='color: red'>
                  <i class="fas fa-exclamation-triangle"></i>&nbsp;&nbsp;Error<br>
                  <small style='white-space: normal' class='text-muted'>line ${queue.errorLine}, pos ${queue.errorPosition}</small>
                </div>              
              </template>
              <template v-else>
                <button @click.stop='clickPlayButton' class="btn btn-outline-primary btn-sm">
                    <font-awesome-icon :icon="['fa', 'play']" title="start new session with this queue"/>
                </button>
              </template>
            </div>
          </template>
          <template v-else>
              <div style='white-space: normal;' v-html="getProp(queue, field)"/>
          </template>
      </td>
  </tr>
</template>

<script>
import server from '@/webcomps/msgsToServer.js'
import Utils from '@/webcomps/utilsFns.js'
import jt from '@/webcomps/jtree.js'

export default {
  name: 'QueueRow',
  props: {
    fields: Array,
    queue: Object,
  },
  methods: {
    clickPlayButton() {
      server.startSessionFromQueue(this.queue.id);
      window.vue.$bvModal.hide('openQueueModal');
      jt.addLog('Opening Queue ' + this.queue.id + '.');
    },
    appText(app) {
      var text = app.appId;
      if (Utils.objLength(app.options) > 0) {
          text += '(';
      }
      for (var i in app.options) {
          text += i + '=' + app.options[i] + ', ';
      }
      if (Utils.objLength(app.options) > 0) {
          text = text.substring(0, text.length - 2);
          text += ')';
      }
      return text;
    },
    getProp(obj, field) {
      try {
        return eval('obj.' + field);
      } catch {
        return '-';
      }
    },
  }
}
</script>

