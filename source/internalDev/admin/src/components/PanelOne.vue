<template>
    <div>
        Panel One: {{dat.x}}
    </div>
</template>

<script>
export default {
  name: 'PanelOne',
  props: [
    'dat',
  ]
}

</script>