<template>
    <div>
    <action-bar
      :menus='actions'>
    </action-bar>
    <div>
        0:00 - start<br>
        0:10 - P1, end Instructions<br>
        0:15 - P2, end Instructions<br>
        </div>
    </div>
</template>
<script>
  export default {
      name: 'SessionActionsPanel',
    props: [
        'dat',
        'panel',
    ],
    data() { return {
                actions: [
                {
                    title: 'Next',
                    hasParent: false,
                    icon: 'fas fa-arrow-right',
                    action: this.createNewParticipant,
                },
                {
                    title: 'Previous',
                    hasParent: false,
                    icon: 'fas fa-arrow-left',
                    action: this.fetchData,
                },
                ]
    }},
    mounted() {
        this.panel.id = 'Actions';
    },
  }
</script>