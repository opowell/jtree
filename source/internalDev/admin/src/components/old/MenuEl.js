import MenuItem from './MenuItem.js';
import jQuery from 'jQuery';

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
      <div class="menu dropdown" :class='{ "menu-active": menu.isActive !== false }' :id='"menu-" + menu.id'>
        <div class="menu-text" tabindex="-1" @click='click' @mouseover='hover'>
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
      methods: {
        click: function(ev) {
          ev.stopPropagation();
          var menu = jQuery(ev.target).closest('.menu');
          if (menu.hasClass('show')) {
              window.jt.closeMenu();
          } else {
              window.jt.openMenu(menu);
          }
        },
        hover: function(ev) {
          // Explicitly turn off, otherwise leave on.
          if (this.menu.focusOnHover !== false) {
            // Is there a menu open?
            var menuOpen = jQuery('.menu.show').length > 0;
            var menu = jQuery(ev.target).closest('.menu');
            if (menuOpen && !menu.hasClass('show')) {
              jQuery(ev.target).click();
            }
          }
        }
      }
    };