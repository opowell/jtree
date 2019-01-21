<template>
    <div class='main-menu no-text-select' :style='mainMenuStyle'>
        <menu-el v-for='menu in menus' :key='menu.text' :menu='menu'></menu-el>
        <div class='spacer'></div>
    </div>

</template>

<script>

import MenuEl from './MenuEl'
export default {
  name: 'ActionBar',
  components: {
      MenuEl,
  },
  props: [
      'menus',
  ],
  computed: {
      mainMenuStyle() { return {
          'background-color': this.menuBGColor,
          'color': this.menuColor,
      }},
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.main-menu {
   display: flex;
    flex: 0 0 auto;
}

/* .main-menu .menu {
    /* padding: 0px 7px; */
/* }  */


.main-menu .menu:hover {
    background-color: var(--menuHoverBGColor);
}

.spacer {
    flex: 1 1 auto;
}

</style>
