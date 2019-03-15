<template>
    <div class='main-menu no-text-select' :style='mainMenuStyle'>
        <menu-el v-for='menu in menus' :key='menu.text' :menu='menu'></menu-el>
    </div>
</template>

<script>

const menusData = [
    {
        text: 'File',
        children: [
            {
                text: 'Games',
                shortcut: 'Ctrl+G',
            },
            {
                text: 'Sessions',
            },
            {
                text: 'Users',
            },
            {
                text: 'Settings',
            },
            {
                text: 'Window',
            },
        ]
    },
    {
        text: 'Edit',
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
    },
    {
        text: 'Session',
    },
    {
        text: 'Window',
        children: [],
    },
]

import MenuEl from './MenuEl'
export default {
  name: 'MainMenu',
  components: {
      MenuEl,
  },
  data() {
      menusData[0].children[0].text = this.$store.state.appName + 's';
      menusData[0].children[0].action = this.showGames;
      menusData[0].children[3].action = this.showSettings;
      return {
          menus: menusData,
          panelDescs: this.$store.state.panelDescs,
          menuBGColor: "rgb(251, 251, 251)",
      }
  },
  computed: {
      mainMenuStyle() { return {
          'background-color': this.menuBGColor,
      }}
  },
  watch: {
      panelDescs: {
        handler: function(newval) {
            // Update Window menu.
            menusData[4].children.splice(0, menusData[4].children.length);
            this.setWindowMenuChildren(newval);
        },
        deep: true,
      }
  },
  methods: {
    setWindowMenuChildren(newval) {
        for (let i=0; i<newval.length; i++) {
            const panel = this.$store.state.panels[i];
            const menuData = {
                text: panel.dataTitle,
                panel: panel,
                action: panel.focus,
                icon: panel.isFocussed ? 'fas fa-check' : '',
            };
            menusData[4].children.push(menuData);
            window.vue.$watch(
                function() {
                    return panel.isFocussed; 
                },
                function(newval) {
                    menuData.icon = newval ? 'fas fa-check' : '';
                }
            );
        }
    },    
    showGames() {
      this.$store.commit('showPanel', {
        type: 'games-panel',
        w: 500,
        h: 300,
      });
    },
    showSettings() {
      this.$store.commit('showPanel', {
        type: 'settings-panel',
        w: 500,
        h: 300,
      });
    }
  },
  mounted() {
    let that = this;
    this.$root.$nextTick(function() {
        that.setWindowMenuChildren(that.$store.state.panelDescs);
    });
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.main-menu {
   display: flex;
    z-index: 10000;
}

.main-menu .menu {
    padding: 0px 7px;
}

.main-menu .menu:hover {
    background-color:rgba(0, 123, 255, 0.13);
    color: #000;
    border-color: rgba(0, 123, 255, 0.26);
}

</style>
