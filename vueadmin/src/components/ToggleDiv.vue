<template>
  <div class="toggle" state="closed" :toggleId="toggleId">
      <div class="toggleTitleDiv" onclick="jt.toggleEvent(event)">
        <font-awesome-icon 
        :toggleId="toggleId" 
        class="toggleContentClosed" 
        :icon="['far', 'plus-square']"
        />
        <font-awesome-icon 
        :toggleId="toggleId" 
        class="toggleContentOpen hidden" 
        :icon="['far', 'minus-square']"
        />
        <div class="ml-1">{{title}} />
        <div class="toggleContentDiv toggleContentOpen hidden" :toggleId="toggleId" />
        </div>
      </div>
</template>

<script>

import 'jquery'
let $ = window.jQuery
import jt from '@/webcomps/jtree.js'

export default {
  name: 'AppPreview',
  components: {
  },
  props: [
      'toggleId',
      'title',
  ],
  data() {
      return {
          filterText: '',
      }
  },
  methods: {
      changeFilterText() {
          this.$emit('changeFilterText');
      },
  },
}

</script>