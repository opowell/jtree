<template>
    <div class='main-menu'>
        <menu-el v-for='menu in menus' :key='menu.text' :menu='menu'></menu-el>
    </div>
</template>

<script>
import GamesPanel from './GamesPanel'
import Vue from 'vue'

let showGames = function() {
    console.log('show games');
    var ComponentClass = Vue.extend(GamesPanel)
    var instance = new ComponentClass()
    instance.$mount() // pass nothing
    document.querySelector('.panel-container').appendChild(instance.$el)
}

const menusData = [
    {
        text: 'File',
        children: [
            {
                text: 'Games',
                action: showGames,
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
]

import MenuEl from './MenuEl'
export default {
  name: 'MainMenu',
  components: {
      MenuEl,
  },
  data() {
      return {
          menus: menusData, 
      }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.main-menu {
    background-color: rgb(251, 251, 251);
   display: flex;
    z-index: 10000;
 -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome and Opera */
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
