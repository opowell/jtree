<template>
  <div v-if='menu === "divider"' class="divider"></div>
  <span v-else :ref='menu.ref' class="menu" @mousedown.prevent.stop @click.stop @mouseup.prevent.stop='click' @mouseover='hover' :class='{ "active": menu.isActive !== false, open: isOpen }' :title='menu.title'>
    <div v-show='menu.template != null' v-html="menu.template"></div>
    <i v-show='menu.icon || showIcon' :class='"icon " + menu.icon'></i>
    <div v-show='menu.text' class='text'>
      <div class='text-first'>{{firstLetter}}</div>
      <div class='text-rest'>{{rest}}</div>
    </div>
    <div v-show="hasParent" class="shortcut">{{menu.shortcut}}</div>
    <div v-show='showArrow' class="arrow">&lt;</div>
    <div v-show='menu.children' class="dropdown" :class='{ open: isOpen}'>
      <menu-el v-for="item in menu.children" :menu='item' :showIcon='menu.showIcon' :key='item.id'></menu-el>
    </div>
  </span>
</template>

<script>
export default {
  name: 'MenuEl',
  props: [
    'menu',
    'showIcon',
  ],
  computed: {
    hasParent() {
      return this.menu.hasParent == null ? true : this.menu.hasParent;
    },
    hasChildren() {
      return this.menu.children != null && this.menu.children.length > 0;
    },
    showArrow() {
      return this.hasParent && this.hasChildren;
    },
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
      if (this.menu.action != null) {
        this.menu.action(this.menu.clickData, ev);
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

<style>
.icon {
  flex: 0 0 auto;
  padding: 5px;
  cursor: default;
  margin-right: 1px;
  width: 24px;
  align-self: center;
  text-align: center;
  line-height: 1;
}
</style>

<style scoped>
.divider {
  border-bottom: 1px solid;
  color: #888;
  margin: 2px 0px;
}

.shortcut {
    flex: 0 0 auto;
    margin-left: 4rem;
    padding: 4px 3px;
}

.arrow {
    width: 20px;
    position: relative;
    padding-left: 3px;
    padding-right: 3px;
    text-align: center;
}
/* .icon:hover {
  background-color: #EEE;
} */
.menu.open {
    box-shadow: none;
    outline: none;
}
.active {
  /* color: red; */
}
.dropdown {
  z-index: 1000;
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
    flex: 1 0 auto;
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
