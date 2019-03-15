<template>
    <div>Sessions list</div>
</template>
<script>
  export default {
      name: 'SessionsPanel',
      props: ['dat'],
      data() {
          return {
              menus: [
                {
                    text: 'Start'
                }, 
                {
                    text: 'New'
                },
              ],
          }
      },
  }
</script>