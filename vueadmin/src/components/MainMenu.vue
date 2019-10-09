<template>
    <div class='main-menu no-text-select' :style='mainMenuStyle'>
        <menu-el 
            v-for='menu in menuData'
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
import server from '@/webcomps/msgsToServer.js'
import jt from '@/webcomps/jtree.js'

jt.openUrl = function(url) {
    window.open(url, '_blank');
}

export default {
  name: 'MainMenu',
  components: {
      MenuEl,
  },
  data() {
      return {
          windowDescs: this.$store.state.windowDescs,
          menuData: [],
      }
  },
  computed: {
    // menus() {
    //   let out = this.recalcMenu();
    //   return out;
    // },
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
    created() {
        this.$store.watch(
            (state) => state.windowDescs,
            (newValue, oldValue) => {
                console.log(`Updating from ${oldValue} to ${newValue}`);
                this.recalcMenu();
            },
        );
        this.$nextTick(function() {
            this.recalcMenu();
        });
    },
    watch: {
        windowDescs: {
            handler: function() {
                this.recalcMenu();
            },
            deep: true,
        }
    },
    methods: {
        recalcMenu() {
            let windowMenu = {
                text: 'Window',
                hasParent: false,
                children: [
                    // {
                    //     text: 'New',
                    //     children: [
                    //         {
                    //             text: 'Design',
                    //             action: this.showDesignWindow,
                    //         },
                    //         {
                    //             text: 'Run',
                    //             action: this.showRunWindow,
                    //         },
                    //     ],
                    // },
                    // 'divider',
                ],
                showIcon: true,
            };
            let out = [
                {
                    text: 'File',
                    hasParent: false,
                    children: [
                        {
                            text: 'Welcome',
                            action: this.showPanel,
                            clickData: 'ViewWelcome',
                        },
                        {
                            text: 'Apps',
                            action: this.showPanel,
                            clickData: 'ViewApps',
                        },
                        {
                            text: 'Queues',
                            action: this.showPanel,
                            clickData: 'ViewQueues',
                        },
                        {
                            text: 'Log',
                            action: this.showPanel,
                            clickData: 'ViewLog',
                        },
                        {
                            text: 'Settings',
                            action: this.showPanel,
                            clickData: 'settings-panel',
                        },
                        'divider',
                        {
                            text: 'Old interface',
                            action: jt.openUrl,
                            clickData: '/admin/multiuser',
                        },
                        {
                            text: 'Help',
                            action: jt.openUrl,
                            clickData: '/help/index.html',
                        },

                        // {
                        //     text: 'Files',
                        //     action: this.showPanel,
                        //     clickData: 'files-panel',
                        // },
                        // {
                        //     text: this.$store.state.appName + 's',
                        //     shortcut: 'Ctrl+G',
                        //     action: this.showPanel,
                        //     clickData: 'games-panel',
                        // },
                        // {
                        //     text: 'Sessions',
                        //     action: this.showPanel,
                        //     clickData: 'sessions-panel',
                        // },
                        // {
                        //     text: 'Users',
                        // },
                        // {
                        //     text: 'Rooms',
                        // },
                        // 'divider',
                    ]
                },
                {
                    text: this.$store.state.appName,
                    hasParent: false,
                    children: [
                        {
                            text: 'New...',
                            action: jt.showCreateAppModal,
                        },
                        {
                            text: 'Open...',
                            action: jt.showOpenAppModal,
                        },
                        {
                            text: 'Manage',
                            action: this.showPanel,
                            clickData: 'ViewApps',
                        },
                    ]
                },
                {
                    text: 'Queue',
                    hasParent: false,
                    children: [
                        {
                            text: 'New...',
                            action: jt.showCreateQueueModal,
                        },
                        {
                            text: 'Open...',
                            action: jt.showOpenQueueModal,
                        },
                        {
                            text: 'Manage',
                            action: this.showPanel,
                            clickData: 'ViewQueues',
                        },
                    ]
                },
                {
                    text: 'Session',
                    hasParent: false,
                    children: [
                        {
                            text: 'New...',
                            action: jt.showCreateAppModal,
                        },
                        'divider',
                        {
                            text: 'Start',
                            action: server.sessionStart,
                            disabled: 'this.$store.state.session == null'
                        },
                        {
                            text: 'Advance slowest',
                            action: server.sessionAdvanceSlowest,
                            disabled: 'this.$store.state.session == null',
                        },
                        {
                            text: 'Reset',
                            action: server.resetSession,
                            disabled: 'this.$store.state.session == null',
                        },
                        {
                            text: 'Download output',
                            action: jt.downloadOutput,
                            disabled: 'this.$store.state.session == null',
                        },
                        {
                            text: 'Delete...',
                            action: jt.deleteSessionPrompt,
                            disabled: 'this.$store.state.session == null',
                        },
                        'divider',
                        {
                            text: 'Controls',
                            action: this.showPanel,
                            clickData: 'ViewSessionControls',
                            disabled: 'this.$store.state.session == null',
                        },
                        {
                            text: this.$store.state.appName + 's',
                            action: this.showPanel,
                            clickData: 'ViewSessionApps',
                            disabled: 'this.$store.state.session == null',
                        },
                        {
                            text: 'Activity',
                            action: this.showPanel,
                            clickData: 'ViewSessionActivity',
                            disabled: 'this.$store.state.session == null',
                        },
                        {
                            text: 'Participants',
                            action: this.showPanel,
                            clickData: 'ViewSessionParticipants',
                            disabled: 'this.$store.state.session == null',
                        },
                        {
                            text: 'Settings',
                            action: this.showPanel,
                            clickData: 'ViewSessionSettings',
                            disabled: 'this.$store.state.session == null',
                        },
                        'divider',
                        {
                            text: 'Window',
                            action: this.showSessionWindow,
                            disabled: 'this.$store.state.session == null',
                        }
                    ],
                },
                windowMenu,
            ];
            let numWindows = this.$store.state.windowDescs.length;
            for (let i=0; i<numWindows; i++) {
                const panel = this.$store.state.windows[i];
                const menuData = {
                    text: this.getWindowTitle(panel.area),
                    panel: panel,
                    action: panel.focus,
                    icon: panel.isFocussed ? ['fas', 'check'] : null,
                    shortcut: 'Ctrl+' + (i+1),
                };
                windowMenu.children.push(menuData);
                window.vue.$watch(
                    function() {
                        return panel.isFocussed; 
                    },
                    function(newval) {
                        menuData.icon = newval ? ['fas', 'check'] : null;
                    }
                );
            }
            if (numWindows > 0) {
                windowMenu.children.push('divider');
            }
            windowMenu.children.push(
                {
                    text: 'Close All',
                    action: this.closeAll,
                }
            );
            windowMenu.children.push(
                {
                    text: 'Reset',
                    action: this.resetWindows,
                }
            ),
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
            this.menuData = out;
        },
        getWindowTitle(win) {
            let out = '';
            try {
                if (win.panels != null) {
                    for (let i in win.panels) {
                        out = out + (out == '' ? '' : ', ') + win.panels[i].id;
                    }
                }
                if (win.areas != null) {
                    for (let i in win.areas) {
                        out = out + (out == '' ? '' : ', ') + this.getWindowTitle(win.areas[i]);
                    }
                }
            } catch (err) {
                out = 'error';
            }
            return out;
        },
        restore() {
            
        },
        close() {

        },

        resetWindows() {
            this.$store.dispatch('resetWindows');
        },

        closeAll() {
            this.$store.commit('closeAllWindows');
        },
        // setWindowMenuChildren(newval) {
        // },
        showPanel(type) {
            this.$store.dispatch('showPanel', {type: type});
        },

        showSessionWindow() {
            this.$store.dispatch('showSessionWindow2');
        },
        showDesignWindow() {
            this.$store.dispatch('showPanel', {type: 'game-tree-panel'});
        },
        showRunWindow() {
            this.$store.dispatch('showPanel', {type: 'session-actions-panel'});
        }
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
    z-index: 1039; /* z-index of modal backdrops is 1040 */
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

.main-menu .disabled:hover {
    background-color: inherit;
    border-color: transparent;
}

.spacer {
    flex: 1 1 auto;
}

</style>
