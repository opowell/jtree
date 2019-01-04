<template>
    <div class='panel-header'>
        <menu-el :menu='{icon: "fa fa-align-center"}'></menu-el>
        <span class='title'>
          {{title}}
        </span>
        <menu-el v-for='menu in menus' :key='menu.text' :menu='menu'>
        </menu-el>
        <menu-el :menu='{icon: "far fa-window-minimize"}'></menu-el>
        <menu-el :menu='{icon: "far fa-window-restore", action: restore}'></menu-el>
        <menu-el :menu='{icon: "far fa-window-close"}'></menu-el>
    </div>
</template>

<script>
import MenuEl from './MenuEl.vue'

const restoreFn = function(ev) {
  const state = window.vue.$store.state;
  state.panelsMaximized = !state.panelsMaximized;
  state.activePanel = ev.path[3]; // should be a "div.panel".
}

export default {
  name: 'PanelHeader',
  components: {
    MenuEl,
  },
  props: [
    'menus',
    'title',
  ],
  methods: {
    restore: restoreFn.bind(this),
  }
}
</script>

<style scoped>
.panel-header {
  display: flex;
  padding: 2px 1px;
  align-items: baseline;
}
.title {
  margin-left: 3px;
  flex: 1 1 auto;
}

.panel-header .menu:hover {
    background-color: #EEE;
    color: #000;
}

.panel-header .menu {
  border-radius: 3px;
  margin-right: 3px;
}

</style>