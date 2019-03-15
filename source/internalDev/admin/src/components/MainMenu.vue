<template>
    <div class='main-menu no-text-select' :style='mainMenuStyle'>
        <menu-el 
            v-for='menu in menus'
            :key='menu.text'
            :menu='menu'
            :style='menuElStyle'
        ></menu-el>
        <div class='spacer'></div>
        <!-- <div v-show='panelsMaxed' style='display: flex'>
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
        </div> -->
    </div>

</template>

<script>

import MenuEl from './MenuEl'
export default {
  name: 'MainMenu',
  components: {
      MenuEl,
  },
  data() {
      return {
          windowDescs: this.$store.state.windowDescs,
      }
  },
  computed: {
          menus() {
              let windowMenu =     {
        text: 'Window',
        hasParent: false,
        children: [],
        showIcon: true,
    };
              let out = 
[
    {
        text: 'File',
        hasParent: false,
        children: [
            {
                text: 'Files',
                action: this.showPanel,
                clickData: {
                    type: 'files-panel',
                    title: 'Files',
                },
            },
            {
                text: this.$store.state.appName + 's',
                shortcut: 'Ctrl+G',
                action: this.showPanel,
                clickData: {
                    type: 'games-panel',
                    title: 'Games',
                },
            },
            {
                text: this.$store.state.appName + ' Tree',
                action: this.showPanel,
                clickData: {
                    type: 'game-tree-panel',
                    title: 'Game Tree',
                },
            },
            {
                text: 'Session Info',
                action: this.showPanel,
                clickData: {
                    type: 'session-info-panel',
                    title: 'Session Info',
                },
            },
            {
                text: 'Sessions',
                action: this.showPanel,
                clickData: {
                    type: 'sessions-panel',
                    title: 'Sessions',
                },
            },
            {
                text: 'Users',
            },
            'divider',
            {
                text: 'Settings',
                action: this.showPanel,
                clickData: {
                    type: 'settings-panel',
                    title: 'Settings',
                },
            },
        ]
    },
    {
        text: 'Edit',
        hasParent: false,
        children: [
            {
                text: 'Cut',
            },
            {
                text: 'Copy',
            },
            {
                text: 'Paste',
            },
            {
                text: 'Find',
            },
        ]
    },
    {
        text: this.$store.state.appName,
        hasParent: false,
    },
    {
        text: 'Run',
        hasParent: false,
    },
    {
        text: 'Tools',
        hasParent: false,
    },
    {
        text: 'View',
        hasParent: false,
    },
    {
        text: '?',
        hasParent: false,
    },
    {
        text: 'Session',
        hasParent: false,
    },
    windowMenu,
];
    let numWindows = this.$store.state.windows.length;
        for (let i=0; i<numWindows; i++) {
            const panel = this.$store.state.windows[i];
            const menuData = {
                text: 'need a title',
                panel: panel,
                action: panel.focus,
                icon: panel.isFocussed ? 'fas fa-check' : '',
                shortcut: 'Ctrl+' + (i+1),
            };
            windowMenu.children.push(menuData);
            window.vue.$watch(
                function() {
                    return panel.isFocussed; 
                },
                function(newval) {
                    menuData.icon = newval ? 'fas fa-check' : '';
                }
            );
        }
        windowMenu.children.push('divider');
        windowMenu.children.push(
            {
                text: 'Close All',
            }
        );
        windowMenu.children.push(
            {
                text: 'Split horizontally',
                action: this.splitMultiPanel,
                clickData: 'horizontal',
            }
        );
        windowMenu.children.push(
            {
                text: 'Split vertically',
                action: this.splitMultiPanel,
                clickData: 'vertical',
            }
        );
        return out;

          },
      mainMenuStyle() { return {
        //   'background-color': this.$store.state.menuBGColor,
        //   'color': this.$store.state.menuColor,
      }},
      panelsMaxed() {
          return this.$store.state.panelsMaximized;
      },
      menuElStyle() { return {
          padding: this.$store.state.mainMenuPadding,
      }},
  },
  watch: {
    //   windowDescs: {
    //     handler: function(newval) {
    //         // Update Window menu.
    //         this.menus[4].children.splice(0, this.menus[4].children.length);
    //         this.setWindowMenuChildren(newval);
    //     },
    //     deep: true,
    //   }
  },
  methods: {
      restore() {
          
      },
      close() {

      },
    // setWindowMenuChildren(newval) {
    // },
    showPanel(data) {
        if (this.$store.state.windowsMaximized && this.$store.state.windowDescs.length > 0) {
            this.$store.commit('addPanelToActiveWindow', {
                id: data.title,
                type: data.type,
                data: data.data,
            });
        } else {
            this.$store.commit('showWindow', {
                panels: [
                    {
                        id: data.title,
                        type: data.type,
                        data: data.data,
                    },
                ],
                areas: [],
                w: 500,
                h: 300,
                flex: '1 1 100px',
            });
        }
    },
  },
//   mounted() {
//     let that = this;
//     this.$root.$nextTick(function() {
//         that.setWindowMenuChildren(that.$store.state.windowDescs);
//     });
//   },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.main-menu {
   display: flex;
    z-index: 10000;
    flex: 0 0 auto;
    background-color: var(--menuBGColor);
    color: var(--menuColor);
}

.main-menu .menu {
    padding: 0px 7px;
}


/* zTree
 .main-menu .menu:hover {
    background-color:rgba(0, 123, 255, 0.13);
    color: #000;
    border-color: rgba(0, 123, 255, 0.26);
} */

.main-menu .menu:hover {
    background-color:var(--menuHoverBGColor);
    border-color:var(--menuHoverBorderColor);
}

.spacer {
    flex: 1 1 auto;
}

</style>
