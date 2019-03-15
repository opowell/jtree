
<template>
<!-- For some reason, needs to be its own component for click + dblclick to work. -->
    <span
        class='tab spacer'
        @dblclick='restore'
    />
</template>

<script>
export default {
    name: 'JtSpacer',
    methods: {
        restore() {
            this.$store.commit('toggleWindowsMaximized');
        },
    },
}
</script>

<style scoped>
.spacer {
    flex: 1 1 auto;
}
</style>
