<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <h2>{{ count }}</h2>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  computed: {
    count () {
      return this.$store.state.count
    }
  }
}
</script>