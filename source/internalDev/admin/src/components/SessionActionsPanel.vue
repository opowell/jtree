<template>
    <div>
        <action-bar
            :menus='actions'
        />
        <div style='flex: 1 1 auto; align-self: stretch'>
            <div class="loading" v-if="loading">
                Loading...
            </div>
            <jt-tree ref='messagesTree'
                :nodesProp='messages'
                :keyField='"id"'
                :allowChildren='false'
                :headers='[
                {
                    label: "id",
                    value: "id",
                },
                {
                    label: "name",
                    value: "name",
                },
                {
                    label: "content",
                    value: "content",
                }]'            
            >
                <template #id="{nodeProp, tree}">
                    <div :style='nodeStyle(nodeProp)'>
                        {{ (isProcessed(nodeProp) ? '*' : '') + nodeProp.id}}
                    </div>
                </template>
            </jt-tree>
        </div>
    </div>
</template>
<script>
import ActionBar from '@/components/ActionBar.vue'
import JtTree from '@/components/JtTree.vue'

  export default {
      name: 'SessionActionsPanel',
        components: {
            'action-bar': ActionBar,
            'jt-tree': JtTree,
        },
    props: [
        'dat',
        'panel',
    ],
    data() { return {
        loading: false,
                actions: [
                {
                    title: 'Test',
                    hasParent: false,
                    icon: 'fas fa-play',
                    action: this.test,
                },
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
                {
                    title: 'Delete',
                    hasParent: false,
                    icon: 'fas fa-trash',
                    action: this.deleteMessage,
                },
                ]
    }},
    computed: {
            messages() {
                return this.$store.state.session.messages;
            },
            index() {
                return this.$store.state.session.messageIndex;
            },
    },
    methods: {
        isProcessed(node) {
            return node.id <= this.$store.state.session.messageIndex;
        },
        nodeStyle(node) {
            if (this.isProcessed(node)) {
                return {
                    'color': 'red',
                }
            } else {
                return {
                    'color': '#888',
                }
            }
        },
        test() {
            global.jt.socket.emit('testMessage', {
                sessionId: this.$store.state.sessionId,
            });
        },
        keyFunc(item, index) {
            return index;
        },
    },
        watch: {
            messages: function(newVal) {
                this.panel.id = 'Messages (' + newVal.length + ')';
            },
        },
    mounted() {
        this.panel.id = 'Messages';
    },
  }
</script>