<template>
    <div style='padding: 2rem;'>
        id: {{sessionId}}<br>
        testing: off<br>
        <div @click='toggleDefault'>default: {{session.default}}</div>
    </div>
</template>
<script>
  export default {
      name: 'SessionInfoPanel',
    props: [
        'dat',
        'panel',
    ],
    data() {
        return {
            session: {
                default: false,
            }
        }
    },
    computed: {
        sessionId() {
            return this.$store.state.sessionId;
        }
    },
    mounted() {
        this.panel.id = 'Info';
    },
    methods: {
        toggleDefault() {

        },
    },
  }
</script>