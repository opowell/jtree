<template>
    <div class='main-menu no-text-select' :style='mainMenuStyle'>
        <menu-el v-for='menu in menus' :key='menu.text' :menu='menu'></menu-el>
        <div class='spacer'></div>
        <input class="filter" type='text' size='7' v-model='filterText' @change='changeFilterText' placeholder="filter...">
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
  data() {
      return {
          filterText: '',
      }
  },
  methods: {
      changeFilterText() {
          this.$emit('changeFilterText');
      },
  },
  computed: {
      mainMenuStyle() { return {
          'background-color': this.menuBGColor,
          'color': this.menuColor,
      }},
  },
}
</script>

<style scoped>
.main-menu {
   display: flex;
    flex: 0 0 auto;
    background-color: var(--actionBarBGColor);
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
}

/* .main-menu > .menu {
    padding: 10px;
    font-size: 14px;
} */

.main-menu > :first-child {
    border-top-left-radius: 5px;
}

.main-menu .menu:hover {
    background-color: #90cbff;
}

.spacer {
    flex: 1 1 auto;
}

.filter {
    flex: 0 0 70px;
    border-radius: 5px;
    line-height: 1rem;
    border: 1px solid;
    margin-right: 3px;
    margin-top: 2px;
    margin-bottom: 3px;
    padding: 0px 2px;
}

</style>
