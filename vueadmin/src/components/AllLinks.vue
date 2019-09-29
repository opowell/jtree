<template>
    <div>
      <span v-for='(link, index) in links' :key='index'>
          {{link.text}}
      </span>
    </div>
</template>

<script>

export default {
  name: 'AllLinks',
  data() {
    return {
        links: [
          { text: 'Home', panel: 'view-home' },
          { text: 'Apps', panel: 'ViewApps' },
          { text: 'Sessions', panel: 'view-sessions' },
          { text: 'Queues', panel: 'view-queues' },
          { text: 'App', panel: 'ViewApp' },
          { text: 'Session Settings', panel: 'ViewSessionSettings' },
        ]
    }
  },
}

</script>