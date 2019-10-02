<template>
  <div>
      <div>Welcome to <span style='font-weight: bold'>jtree</span>.</div>
      <div style='padding-top: 1rem; color: #888'>0.7.18</div>
      <br>
      <div>
        <span class='link' v-for='(link, index) in links' :key='index' @click='clickLink(index)'>
          {{link.title}}
          </span>
        </div>
  </div>
</template>

<script>

let links = [
  { title: 'Apps',     type: 'ViewApps'      },
  { title: 'Queues',   type: 'ViewQueues'    },
  { title: 'Sessions', type: 'ViewSessions'  },
  { title: 'Settings', type: 'SettingsPanel' },
  { title: 'Log',      type: 'ViewLog'       },
]

export default {
  name: 'ViewWelcome',
  props: [
    'dat',
    'panel',
  ],
  data() {
    return {
      links,
    }
  },
  methods: {
    clickLink(index) {
      let link = this.links[index];
      this.$store.dispatch('showPanel', {type: link.type});
    }
  },
  mounted() {
      this.panel.id = 'Welcome';
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.link {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  padding-top: 0.3rem;
  padding-bottom: 0.3rem;
  margin: 2px;
  color: rgba(255, 255, 255, 0.75);
  background-color: rgba(0, 0, 0, 0.5);
  cursor: pointer;
}

.link:hover {
  background-color: rgba(0, 0, 0, 0.25);
}

</style>
