<template>
    <div
        class='tab'
        @mouseover='hovered = true;'
        @mouseleave='hovered = false;'
        @click='showThisPanel'
    >
        <!-- <span class='closeIcon'/> -->
        <span class='bottomPadding text' :class='{selected: isSelected}'>{{panelInfo.title}}</span>
        <span class='closeIcon bottomPadding' v-show='hovered'>&times;</span>
        <span class='closeIcon bottomPadding' v-show='!hovered'></span>
    </div>
</template>

<script>

// import jt from '@/webcomps/jtree.js'
// import 'jquery'
// let $ = window.jQuery

export default {
  name: 'Tab',
  props: {
    panelInfo: Object,
    index: Number
  },
  data() {
    return {
        hovered: false,
    }
  },
  computed: {
      isSelected() {
          return this.$store.state.shownPanel === this.index;
      }
  },
  methods: {
      showThisPanel() {
          this.$store.commit('setPanel', this.index);
      }
  }
}

</script>

<style scoped>
.tab {
    padding-top: 6px;
    display: flex;
    flex: 0 0 auto;
}

.bottomPadding {
    padding-bottom: 6px;
}

.text {
    padding-left: 8px;
    padding-right: 8px;
}

.selected {
    padding-bottom: 4px;
    border-bottom: 2px solid sandybrown;
    color: #fff;
}

.tab:hover {
    background-color: #9e9e9e;
    color: rgba(255,255,255,.75);
    cursor: pointer;
}
.closeIcon {
    width: 12px;
    margin-right: 3px;
}

</style>