import MenuItem from './MenuItem.js';

export default {
    name: 'MenuEl',
    components: {
      MenuItem
    },
    props: [
      'menu'
    ],
    computed: {
      firstLetter: function() {
        return this.menu.id.substring(0, 1);
      },
      rest: function() {
        return this.menu.id.substring(1);
      }
    },
    template: `
      <div class="menu menu-active dropdown">
        <div class="menu-text" tabindex="-1">
          <template v-if='menu.icon'>
            <i :class="menu.icon"></i>
          </template>
          <template v-else>
            <div class="menu-text-first">{{ firstLetter }}</div>
            <div class="menu-text-rest">{{ rest }}</div>
          </template>
        </div>
        <div class="dropdown-menu menu-dropdown">
          <menu-item v-for="item in menu.children" :item="item" :key='item.id'></menu-item>
        </div>
      </div>
      `,
    };