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
import ActionBar from '@/components/ActionBar.vue'

  export default {
      name: 'SessionActionsPanel',
        components: {
            'action-bar': ActionBar,
        },
    props: [
        'dat',
        'panel',
    ],
    data() { return {
                actions: [
                {
                    title: 'Start',
                    hasParent: false,
                    icon: 'fas fa-fast-backward',
                    action: this.fetchData,
                },
                {
                    title: 'Previous',
                    hasParent: false,
                    icon: 'fas fa-step-backward',
                    action: this.fetchData,
                },
                {
                    title: 'Next',
                    hasParent: false,
                    icon: 'fas fa-step-forward',
                    action: this.createNewParticipant,
                },
                {
                    title: 'End',
                    hasParent: false,
                    icon: 'fas fa-fast-forward',
                    action: this.createNewParticipant,
                },
                ]
    }},
    mounted() {
        this.panel.id = 'Actions';
    },
  }
</script>