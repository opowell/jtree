<template>
    <div>
        <select @change='changeView($event)'>
            <option v-for='part in participants' :key='part.id' :value='part.id'>{{part.id}}</option>
        </select>
        <div v-if='selPart != null'>
            Selected: {{selPart.id}}
        </div>
    </div>
</template>
<script>

import sort from 'alphanum-sort';

  export default {
      name: 'SessionMonitorPanel',
    props: [
        'dat',
        'panel',
    ],
    data() {
        return {
            selPart: null,
        }
    },
    computed: {
        participants() {
            let parts = this.$store.state.session.state.participants;
            if (parts == null) {
                return null;
            }
            let keys = sort(Object.keys(parts));
            let out = [];
            for (let i=0; i<keys.length; i++) {
                out.push(parts[keys[i]]);
            }
            return out;
        },
            panelTitle() {
                if (this.selPart == null) {
                    return 'Monitor';
                }
                return 'Monitor: ' + this.selPart.id;
            },
    },
    methods: {
        changeView(event) {
            console.log(event.target.value);
            this.selPart = null;
            for (let i in this.participants) {
                if (this.participants[i].id === event.target.value) {
                    this.selPart = this.participants[i];
                    return;
                }
            }
        },
    },
    mounted() {
        this.panel.id = 'Monitor';
    },
  }
</script>