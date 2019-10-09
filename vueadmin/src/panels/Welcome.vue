<template>
  <div style='display: flex; flex-direction: column;'>
      <div style='font-size: 1rem;'>Welcome to <span style='font-weight: bold'>jtree</span>.</div>
      <div style='font-size: 1rem; padding-top: 1rem; color: #888; padding-bottom: 1rem;'>0.8.3</div>
      <div style='display: flex'>
        <div style=''>
          <div class='link' onclick='jt.showCreateAppModal()'>Create {{this.$store.state.appName}}...</div>
          <div class='link' onclick='jt.showModal("openAppModal")'>Open {{this.$store.state.appName}}...</div>
        </div>
        <div>
          <div class='link' onclick='jt.showCreateQueueModal()'>Create Queue...</div>
          <div class='link' onclick='jt.showModal("openQueueModal")'>Open Queue...</div>
        </div>
        <div>
          <div class='link' onclick='server.sessionCreate()'>Create Session</div>
          <div class='link' onclick='jt.showModal("openSessionModal")'>Open Session...</div>
        </div>
      </div>
      <br>
      <div style='display: flex'>
        <a class='text-muted' href="/admin/multiuser" target='_blank'>Old interface</a>
        <span>&nbsp;|&nbsp;</span>
        <a class='text-muted' href="/help/index.html" target='_blank'>Help</a>
      </div>
  </div>
</template>

<script>

export default {
  name: 'ViewWelcome',
  props: [
    'dat',
    'panel',
  ],
  mounted() {
      this.panel.id = 'Welcome';
  },
}
</script>

<style scoped>

.link {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  padding-top: 0.3rem;
  padding-bottom: 0.3rem;
  margin: 2px;
  color: rgba(255, 255, 255, 0.75);
  background-color: rgba(0, 0, 0, 0.5);
  cursor: pointer;
  border-radius: 5px;
}

.link:hover {
  background-color: rgba(0, 0, 0, 0.25);
}

</style>
