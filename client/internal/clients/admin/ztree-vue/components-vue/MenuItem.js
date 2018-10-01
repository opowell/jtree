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
    template: `
    <div class="dropdown-item menudditem menu-link" tabindex="-1">
      <div class="menudditem-text">
        <div class="menu-text-first">{{ firstLetter }}</div>
        <div class="menu-text-rest">{{ rest }}</div>
      </div>
      <div class="menudditem-arrow"></div>
    </div>
      `,
    };

    // <div class="menudditem-shortcut">{{shortcut}}</div>
    // <i v-if="icon" :class="icon"></i>
