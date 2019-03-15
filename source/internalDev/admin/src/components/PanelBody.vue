<template>
    <div class='body'>
        <slot></slot>
    </div>
</template>

<script>
export default {
  name: 'PanelBody',
  methods: {
    click() {
      console.log('click panelbody');
    }
  }
}
</script>

<style scoped>
.body {
  background-color: #fff;
  flex: 1 1 auto;
  padding: 2px 6px;
  border: 1px inset rgba(0,0,0,0.3);
  overflow: auto;
}
</style>