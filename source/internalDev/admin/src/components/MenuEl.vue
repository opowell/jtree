<template>
  <span class="menu" @mousedown.prevent.stop @click.stop @mouseup.prevent.stop='click' @mouseover='hover' :class='{ "active": menu.isActive !== false, open: isOpen }'>
    <i v-show='menu.icon || menu.showIcon' :class='"icon " + menu.icon'></i>
    <div v-show='menu.text' class='text'>
      <div class='text-first'>{{firstLetter}}</div>
      <div class='text-rest'>{{rest}}</div>
    </div>
    <div v-show='menu.children' class="dropdown" :class='{ open: isOpen}'>
      <menu-el v-for="item in menu.children" :menu='item' :key='item.id'></menu-el>
    </div>
  </span>
</template>

<script>
export default {
  name: 'MenuEl',
  props: [
    'menu'
  ],
  computed: {
    isActive() {
      return this.$store.state.activeMenu === this;
    },
    isOpen() {
      return this.$store.state.isMenuOpen && this.isActive;
    },
    firstLetter: function() {
      if (this.menu.text == null) {
        return '';
      }
      return this.menu.text.substring(0, 1);
    },
    rest: function() {
      if (this.menu.text == null) {
        return '';
      }
      return this.menu.text.substring(1);
    }
  },
  methods: {
    click: function(ev) {
      console.log('click');
      if (this.menu.action != null) {
        this.menu.action(ev);
        this.$store.state.isMenuOpen = false;
      } else {
        this.$store.state.activeMenu = this;
        this.$store.state.isMenuOpen = !this.$store.state.isMenuOpen;
      }
    },
    hover: function() {
      this.$store.state.activeMenu = this;
    }
  }
}
</script>

<style scoped>
.icon {
  flex: 0 0 auto;
  padding: 5px;
  cursor: default;
  margin-right: 1px;
  width: 24px;
  align-self: center;
  text-align: center;
}

/* .icon:hover {
  background-color: #EEE;
} */
.menu.open {
    border-color: rgb(123, 206, 153);
    box-shadow: none;
    outline: none;
}
.active {
  /* color: red; */
}
.dropdown {

}
.dropdown.open {
  display: block;
}

.dropdown .menu:hover {
  background-color: rgba(0,123,255,.25);
}



.menubar-focussed .text-first {
    text-decoration: underline;
}

.text-first {

}

.text-rest {

}



.menu {
    display: flex;
    flex: 0 0 auto;
    position: relative;
    border-width: 1px;
    border-color: transparent;
    border-style: solid;
}

.text {
    cursor: default;
    border-radius: 0px;
    outline: none;
    box-shadow: none;
    display: flex;
    padding: 4px 3px;
}

.dropdown {
    display: none;
    margin: 0px;
    padding: 3px;
    transform: translate3d(0px, 0px, 0px) !important;
    border-radius: 0px;
    box-shadow: 1px 1px 1px 1px #00000057;
    background-color: hsla(0, 0%, 97%, 1);
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    float: left;
    min-width: 10rem;
    color: #212529;
    text-align: left;
    list-style: none;
    background-clip: padding-box;
    border: 1px solid rgba(0,0,0,.15);
}

.focussed {
    box-shadow: none;
    background-color: rgba(0, 123, 255, 0.25);
    border-color: rgba(0, 123, 255, 0.50);
}

.focussed:hover {
    background-color: rgba(0, 123, 255, 0.25);
    border-color: rgba(0, 123, 255, 0.50);
}
</style>
