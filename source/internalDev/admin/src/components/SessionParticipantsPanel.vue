<template>
    <div>
        <action-bar
            :menus='actions'>
        </action-bar>
        <div style='flex: 1 1 auto; align-self: stretch; overflow: auto'>
            # | name | status<br>
            1 | P1   | playing<br>
            2 | P2   | playing<br>
            3 | P3   | waiting<br>
            4 | P4   | playing<br>
            5 | P5   | playing<br>
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
                    title: 'New',
                    hasParent: false,
                    icon: 'fas fa-plus',
                    action: this.createNewParticipant,
                },
                {
                    title: 'Refresh',
                    hasParent: false,
                    icon: 'fas fa-redo-alt',
                    action: this.fetchData,
                },
                'divider',
                {
                    title: 'Rename',
                    hasParent: false,
                    icon: 'fas fa-font',
                    action: this.renameActiveNode,
                },
                {
                    title: 'Delete',
                    hasParent: false,
                    icon: 'fas fa-trash',
                    action: this.deleteFile,
                },
                ],
    }},
    mounted() {
        this.panel.id = 'Participants';
    },
  }
</script>