<template>
    <div class='panel-header no-text-select' @dblclick='restore'>
        <menu-el :menu='{
          icon: "fa fa-align-center",
          hasParent: false,
        }'></menu-el>
        <span class='title'>
          {{title}}
        </span>
        <menu-el v-for='menu in menus' :key='menu.text' :menu='menu'>
        </menu-el>
        <menu-el :menu='{
          icon: "fas fa-minus",
          action: splitVertical,
          hasParent: false,
        }'></menu-el>
        <menu-el :menu='{
          icon: "fas fa-columns",
          action: splitHorizontal,
          hasParent: false,
        }'></menu-el>
        <menu-el :menu='{
          icon: "far fa-window-minimize",
          hasParent: false,
        }'></menu-el>
        <menu-el :menu='{
          icon: "far fa-window-restore",
          action: restore,
          hasParent: false,
        }'></menu-el>
        <menu-el :menu='{
          icon: "far fa-window-close",
          action: close,
          hasParent: false,
        }'></menu-el>
    </div>
</template>

<script>
import MenuEl from './MenuEl.vue'

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
    restore() {
      this.$store.commit('togglePanelsMaximized');
    },
    close(ev) {
      ev.stopPropagation();
      this.$emit('jt-close');
    },
    splitHorizontal() {
      this.$emit('split-horizontal');
    },
    splitVertical() {
      this.$emit('split-vertical');
    },
  }
}
</script>

<style scoped>
.panel-header {
  display: flex;
  padding: 2px 1px;
  align-items: baseline;
  flex: 0 0 auto;
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
  /* margin-right: 3px; */
}

</style>