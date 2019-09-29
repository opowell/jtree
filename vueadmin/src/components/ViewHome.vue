<template>
  <div>
      Welcome to jtree.
      <div style='padding-top: 1rem; color: #888'>0.7.18</div>
      <br>
      <div>
        <span class='link' v-for='(link, index) in links' :key='index' @click='showThisPanel(index)'>
          {{link.title}}
          </span>
        </div>
  </div>
</template>

<script>

let links = [
  { title: 'Apps',     type: 'ViewApps'      },
  { title: 'Queues',   type: 'view-queues'   },
  { title: 'Sessions', type: 'view-sessions' },
  { title: 'Log',      type: 'ViewLog'       },
]

import jt from '@/webcomps/jtree.js'

export default {
  name: 'ViewHome',
  data() {
    return {
      links,
    }
  },
  methods: {
    showThisPanel(index) {
      let link = this.links[index];
      jt.showPanelNew(link.title, link.type);
    }
  }
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
