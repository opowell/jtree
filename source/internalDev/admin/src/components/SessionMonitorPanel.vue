<template>
    <div>
        VIEWS
    </div>
</template>
<script>
  export default {
      name: 'SessionMonitorPanel',
    props: [
        'dat',
        'panel',
    ],
    mounted() {
        this.panel.id = 'Monitor';
    },
  }
</script>