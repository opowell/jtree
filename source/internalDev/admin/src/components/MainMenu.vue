<template>
    <div class='main-menu no-text-select' :style='mainMenuStyle'>
        <menu-el v-for='menu in menus' :key='menu.text' :menu='menu'></menu-el>
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
          menus: 
[
    {
        text: 'File',
        hasParent: false,
        children: [
            {
                text: 'PanelOne',
                action: this.showPanel,
                clickData: {
                    type: 'panel-one',
                    title: 'Panel One',
                    data: 13,
                },
            },
            {
                text: 'PanelTwo',
                action: this.showPanel,
                clickData: {
                    type: 'panel-two',
                    title: 'Panel Two',
                    data: 35,
                },
            },
            {
                text: 'Files',
                action: this.showFiles,
            },
            {
                text: this.$store.state.appName + 's',
                shortcut: 'Ctrl+G',
                action: this.showGames,
            },
            {
                text: this.$store.state.appName + 's',
                shortcut: 'Ctrl+G',
                action: this.showGames,
            },
            {
                text: 'Sessions',
                action: this.showSessions,
            },
            {
                text: 'Users',
            },
            'divider',
            {
                text: 'Settings',
                action: this.showSettings,
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
        text: 'Treatment',
        hasParent: false,
    },
    {
        text: 'Session',
        hasParent: false,
    },
    {
        text: 'Window',
        hasParent: false,
        children: [],
        showIcon: true,
    },
],
          windowDescs: this.$store.state.windowDescs,
          menuBGColor: "rgb(90, 90, 90)",
          menuColor: 'rgb(185, 185, 185)',
      }
  },
  computed: {
      mainMenuStyle() { return {
          'background-color': this.menuBGColor,
          'color': this.menuColor,
      }},
      panelsMaxed() {
          return this.$store.state.panelsMaximized;
      },
  },
  watch: {
      windowDescs: {
        handler: function(newval) {
            // Update Window menu.
            this.menus[4].children.splice(0, this.menus[4].children.length);
            this.setWindowMenuChildren(newval);
        },
        deep: true,
      }
  },
  methods: {
      restore() {
          
      },
      close() {

      },
    setWindowMenuChildren(newval) {
        for (let i=0; i<newval.length; i++) {
            const panel = this.$store.state.windows[i];
            const menuData = {
                text: 'need a title',
                panel: panel,
                action: panel.focus,
                icon: panel.isFocussed ? 'fas fa-check' : '',
                shortcut: 'Ctrl+' + (i+1),
            };
            this.menus[4].children.push(menuData);
            window.vue.$watch(
                function() {
                    return panel.isFocussed; 
                },
                function(newval) {
                    menuData.icon = newval ? 'fas fa-check' : '';
                }
            );
        }
        this.menus[4].children.push('divider');
        this.menus[4].children.push(
            {
                text: 'Close All',
            }
        );
        this.menus[4].children.push(
            {
                text: 'Split horizontally',
                action: this.splitMultiPanel,
                clickData: 'horizontal',
            }
        );
        this.menus[4].children.push(
            {
                text: 'Split vertically',
                action: this.splitMultiPanel,
                clickData: 'vertical',
            }
        );
    },
    splitMultiPanel(direction) {
        const panel = this.$store.state.activePanel;
        console.log(direction);
        panel.splitOff(0);
    },
    showMultiPanel() {
        this.showPanel('multi-panel');
    },
    showFiles() {
        this.showPanel('files-panel');
    },
    showGames() {
        this.showPanel('games-panel');
    },
    showSettings() {
        this.showPanel('settings-panel');
    },
    showSessions() {
        this.showPanel('sessions-panel');
    },
    showPanel(data) {
        if (this.$store.state.windowsMaximized && this.$store.state.windowDescs.length > 0) {
            this.$store.commit('addPanelToActiveWindow', {
                id: data.title,
                type: data.type,
                data: 13,
            });
        } else {
            this.$store.commit('showWindow', {
                panels: [
                    {
                        id: data.title,
                        type: data.type,
                        data: 13,
                    },
                ],
                areas: [],
                w: 500,
                h: 300,
            });
        }
    },
  },
  mounted() {
    let that = this;
    this.$root.$nextTick(function() {
        that.setWindowMenuChildren(that.$store.state.windowDescs);
    });
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.main-menu {
   display: flex;
    z-index: 10000;
    flex: 0 0 auto;
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
    background-color:rgb(109, 109, 109);
}

.spacer {
    flex: 1 1 auto;
}

</style>
