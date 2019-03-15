<template>
    <div style='padding: 2rem;'>
        id: {{dat}}<br>
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
    mounted() {
        this.panel.id = 'Info';
    },
    methods: {
        toggleDefault() {

        },
    },
  }
</script>