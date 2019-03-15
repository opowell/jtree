<template>
    <div>
    <action-bar
      :menus='actions'>
    </action-bar>
    <div style='padding-top: 10px; padding-bottom: 10px; overflow: auto; flex: 1 1 auto; align-self: stretch'>
        <jt-tree
            :nodesProp='session.gameTree'
        >
        </jt-tree>
    </div>
    </div>
</template>
<script>
import ActionBar from '@/components/ActionBar.vue'
import JtTree from '@/components/JtTree.vue'


  export default {
      name: 'GameTreePanel',
      components: {
        'jt-tree': JtTree,
        'action-bar': ActionBar,
      },
    props: [
        'dat',
        'panel',
    ],
        mounted() {
            this.panel.id = 'Game Tree';
        },

data() {
            return {
              actions: [
                {
                    title: 'Add New Game...',
                    hasParent: false,
                    icon: 'far fa-file',
                }, 
                'divider',
                {
                    title: 'Rename',
                    hasParent: false,
                    icon: 'fas fa-font'
                },
                {
                    title: 'Edit',
                    hasParent: false,
                    icon: 'fas fa-edit',
                },
                {
                    title: 'Remove',
                    hasParent: false,
                    icon: 'fas fa-trash'
                },
              ],

            }
        },
        computed: {
            session() {
                return this.$store.state.session;
            }
        }
}
</script>

<style scoped>
</style>