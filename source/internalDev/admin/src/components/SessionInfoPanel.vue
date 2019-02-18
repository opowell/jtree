<template>
<div>
    <action-bar
        :menus='actions'
    />
    <div style='padding: 2rem;'>
        id: {{sessionId}}<br>
        testing: off<br>
        <div @click='toggleDefault'>default: {{session.default}}</div>
        started: {{started}}<br>
    </div>
</div>
</template>
<script>
import ActionBar from '@/components/ActionBar.vue'
  export default {
      name: 'SessionInfoPanel',
    components: {
        'action-bar': ActionBar,
    },
    props: [
        'dat',
        'panel',
    ],
    data() {
        return {
            session: {
                default: false,
            },
            actions: [
                {
                    title: 'Start',
                    hasParent: false,
                    icon: 'fas fa-play',
                    action: this.start,
                },
            ],
        }
    },
    computed: {
        sessionId() {
            return this.$store.state.sessionId;
        },
        started() {
            return this.$store.state.session.started;
        }
    },
    mounted() {
        this.panel.id = 'Info';
    },
    methods: {
        toggleDefault() {

        },
        start() {
            global.jt.socket.emit('sessionStart', this.$store.state.sessionId);
        },
    },
  }
</script>