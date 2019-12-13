<template>
  <div style='display: flex; flex-direction: column;'>
      <div style='font-size: 1rem;'>Welcome to <span style='font-weight: bold'>jtree</span>.</div>
      <div style='font-size: 1rem; padding-top: 1rem; color: #888; padding-bottom: 1rem;'>0.8.5</div>
      <!-- <div style='margin-bottom: 1rem;'>What would you like to do?</div> -->
      <div style='display: flex'>
        <div style=''>
          <!-- <span class='link' v-for='(link, index) in links' :key='index' @click='clickLink(index)'>
            {{link.title}}
            </span> -->
          <div class='link' onclick='jt.showCreateAppModal()'>Create {{this.$store.state.appName}}...</div>
          <div class='link' onclick='jt.showOpenAppModal()'>Open {{this.$store.state.appName}}...</div>
          <div class='link' onclick='vue.$store.dispatch("showPanel", {type: "ViewApps"})'>Manage {{this.$store.state.appName}}s</div>
        </div>
        <div>
          <!-- <span class='link' v-for='(link, index) in links' :key='index' @click='clickLink(index)'>
            {{link.title}}
            </span> -->
          <div class='link' onclick='jt.showCreateQueueModal()'>Create Queue...</div>
          <div class='link' onclick='jt.showOpenQueueModal()'>Open Queue...</div>
          <div class='link' onclick='vue.$store.dispatch("showPanel", {type: "ViewQueues"})'>Manage Queues</div>
        </div>
      </div>
      <br>
      <div style='display: flex'>
        <a class='text-muted' href="/admin/multiuser" target='_blank'>Old interface</a>
        <span>&nbsp;|&nbsp;</span>
        <a class='text-muted' href="/help/index.html" target='_blank'>Help</a>
      </div>
  </div>
</template>

<script>

let links = [
  // { title: 'Apps',     type: 'ViewApps'      },
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
