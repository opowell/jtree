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
                :rowStyleFunc='nodeStyle'           
            >
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
            title: 'Start',
            hasParent: false,
            icon: 'fas fa-fast-backward',
            action: this.gotoStart,
            enabled: !this.atStart,
        },
        {
            title: 'Previous',
            hasParent: false,
            icon: 'fas fa-step-backward',
            action: this.previous,
        },
        {
            title: 'Next',
            hasParent: false,
            icon: 'fas fa-step-forward',
            action: this.next,
        },
        {
            title: 'End',
            hasParent: false,
            icon: 'fas fa-fast-forward',
            action: this.gotoEnd,
        },
        {
            title: 'Delete',
            hasParent: false,
            icon: 'fas fa-trash',
            action: this.deleteMessage,
        },
        ],
    }},
    computed: {
            messages() {
                return this.$store.state.session.messages;
            },
            index() {
                return this.$store.state.messageIndex;
            },
            atStart() {
                return this.index == 0;
            },
    },
    methods: {
        isProcessed(node) {
            return node.id <= this.index;
        },
        nodeStyle(node) {
            if (this.isProcessed(node)) {
                return {
                }
            } else {
                return {
                    'color': '#AAA',
                }
            }
        },
        keyFunc(item, index) {
            return index;
        },
        next() {
            if (this.index < this.messages.length) {
                this.setIndex(this.index+1);
            }
        },
        previous() {
            if (this.index > 0) {
                this.setIndex(this.index-1);
            }
        },
        gotoStart() {
            this.setIndex(0);
        },
        gotoEnd() {
            this.setIndex(this.messages.length);
        },
        setIndex(i) {
            this.$store.commit('setActionIndex', i);
        },
    },
        watch: {
            messages: function(newVal) {
                this.panel.id = 'Messages (' + this.index + ' / ' + newVal.length + ')';
            },
            index: function(newVal) {
                this.panel.id = 'Messages (' + newVal + ' / ' + this.messages.length + ')';
                this.$forceUpdate();
            },
        },
    mounted() {
        this.panel.id = 'Messages';
    },
  }
</script>