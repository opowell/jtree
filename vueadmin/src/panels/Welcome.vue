<template>
  <div style='display: flex; flex-direction: column; justify-content: center; align-items: center;'>
      <div style='font-size: 4rem;'>Welcome to <span style='font-weight: bold'>jtree</span>.</div>
      <div style='font-size: 2rem; padding-top: 1rem; color: #888; padding-bottom: 3rem;'>0.7.18</div>
      <div style='margin-bottom: 1rem; font-size: 2rem'>What would you like to do?</div>
      <div style='font-size: 2rem'>
        <span class='link' v-for='(link, index) in links' :key='index' @click='clickLink(index)'>
          {{link.title}}
          </span>
          <span class='link' onclick='jt.showCreateAppModal()'>Create App...</span>
      </div>
      <br>
      <br>
      <br>
  </div>
</template>

<script>

let links = [
  { title: 'Apps',     type: 'ViewApps'      },
  { title: 'Queues',   type: 'ViewQueues'    },
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
  border-radius: 5px;
}

.link:hover {
  background-color: rgba(0, 0, 0, 0.25);
}

</style>
