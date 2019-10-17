<template>
      <b-modal 
        id="setAutoplayFreqModal"
        tabindex="-1"
        role="dialog"
        title="Set Autoplay Delay"
        >
        <div>
            Delay:
            <input id='setAutoplayFreq-input' style='width: 10em;' value='2000'>
        </div>
        <small class="form-text text-muted">An expression that returns the number of milliseconds to wait before autoplaying again. E.g. <code>2000</code>, or <code>Math.random()*1000 + 500</code>.</small>
        <template v-slot:modal-footer="{ hide }">
            <button type="button" class="btn btn-outline-secondary" @click='hide'>Close</button>
            <button type="button" class="btn btn-primary" onclick='jt.updateAutoplayFreq();'>Set</button>
        </template>
      </b-modal>
</template>

<script>
import jt from '@/webcomps/jtree.js'
import 'jquery'
let $ = window.jQuery

jt.showSetAutoplayFreqModal = function() {
    window.vue.$bvModal.show('setAutoplayFreqModal');
}

jt.updateAutoplayFreq = function() {
    let d = {};
    d.sId = jt.data.session.id;
    d.val = $('#setAutoplayFreq-input').val();
    jt.socket.emit('setAutoplayDelay', d);
    window.vue.$bvModal.hide('setAutoplayFreqModal');
}

export default {
  name: 'SetAutoplayFreq',
  data() {
    return {
        state: this.$store.state
    }
  },
}

</script>