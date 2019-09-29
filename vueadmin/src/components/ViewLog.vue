<template>
  <div>
      <h2>Log</h2>
      <table class='table table-hover' style='width: 100% !important;'>
          <thead>
              <tr>
                  <th>Time</th>
                  <th>Message</th>
              </tr>
          </thead>
          <tbody>
              <tr v-for='(entry, index) in log' :key='index'>
                  <td>{{entry.dateString}} {{entry.timeString}}</td>
                  <td>{{entry.message}}</td>
              </tr>
          </tbody>
      </table>
  </div>
</template>

<script>

import jt from '@/webcomps/jtree.js'
import 'jquery'
let $ = window.jQuery

export default {
  name: 'ViewLog',
  data() {
    return {
        log: this.$store.state.log
    }
  },
}

jt.addLog = function(text) {
    let time = new Date();
    window.vue.$store.state.log.push({
        timeStamp: time.getTime(),
        dateString: time.toDateString(),
        timeString: time.toTimeString(),
        utcString: time.toUTCString(),
        message: text
    })
    jt.popupLogMessage(text);
}

jt.popupLogMessage = function(text) {
    let el = $('#logMessage');
    if($(el).is(':animated')) {
        el.stop();
    }
    el.css('display', 'block');
    $('#logMessageText').html(text);
    el.delay(1200).fadeOut(700);
}

</script>

<style scoped>
td {
    white-space: normal;
    word-break: break-all;
}

</style>