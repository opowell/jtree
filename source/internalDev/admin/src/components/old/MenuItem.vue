<template>
  <div @click='click' v-if='item === "divider"' class="dropdown-divider"></div>
  <div @click='click' v-else class="dropdown-item menudditem menu-link" tabindex="-1">
    <div class="menudditem-text">
      <i :class="item.icon"></i>
      <div class="menu-text-first">{{ firstLetter }}</div>
      <div class="menu-text-rest">{{ rest }}</div>
    </div>
    <div class="menudditem-shortcut">{{item.shortcut}}</div>
    <div class="menudditem-arrow"></div>
  </div>
</template>

<script>
export default {
    name: 'MenuItem',
    props: [
      'item'
    ],
    computed: {
      firstLetter: function() {
        return this.item.id != null ? this.item.id.substring(0, 1) : '';
      },
      rest: function() {
        return this.item.id != null ? this.item.id.substring(1) : '';
      }
    },
    methods: {
      click: function(ev) {
        if (this.item.children == null) {
          ev.preventDefault();
          ev.stopPropagation();
          jt.closeMenu();
          console.log('running ' + this.item.fn);
          eval(this.item.fn);
        }
      }
    }
  };  
</script>

<style scoped>

</style>