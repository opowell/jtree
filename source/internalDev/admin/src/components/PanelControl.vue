<template>
    <div :class='"control" + iconClass'>
        {{title}}
    </div>
</template>

<script>
export default {
  name: 'PanelControl',
  props: [
    'iconClass',
  ],
}
</script>

<style scoped>
.control {
  flex: 0 0 auto;
  padding: 5px;
  cursor: default;
  margin-right: 1px;
  border-radius: 3px;
}
</style>