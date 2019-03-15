<template>
  <div>
    <action-bar
      :menus='actions'>
    </action-bar>
    <div style='flex: 1 1 auto; align-self: stretch'>
        <div class="loading" v-if="loading">
        Loading...
        </div>
        <jt-tree ref='sessionsTree'
            :nodesProp='sessions'
            :f2Func='renameSession'
            :dblClickFunc='openSession'
            :titleField='"id"'
            :keyField='"id"'
            :allowChildren='false'
            @deleteNode='deleteSession'
        >
        </jt-tree>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
import ActionBar from '@/components/ActionBar.vue'
import JtTree from '@/components/JtTree.vue'

export default {
        name: 'SessionsPanel',
        components: {
            'action-bar': ActionBar,
            'jt-tree': JtTree,
        },
    props: [
        'dat',
        'panel',
    ],
        data() {
            return {
                contextMenuIsVisible: true,
                loading: true,
                actions: [
                {
                    title: 'New session',
                    hasParent: false,
                    icon: 'fas fa-plus',
                    action: this.createNewSession,
                },
                {
                    title: 'Rename',
                    hasParent: false,
                    icon: 'fas fa-font',
                    action: this.renameActiveNode,
                },
                {
                    title: 'Refresh',
                    hasParent: false,
                    icon: 'fas fa-redo-alt',
                    action: this.fetchData,
                },
                {
                    title: 'Open',
                    hasParent: false,
                    icon: 'fas fa-play',
                    action: this.openSession,
                },
                {
                    title: 'Delete',
                    hasParent: false,
                    icon: 'fas fa-trash',
                    action: this.deleteSession,
                },
                ],
            }
        },
        mounted() {
            this.panel.id = 'Sessions';
        },
        created() {
            this.fetchData();
        },
        computed: {
            sessions() {
                return this.$store.state.sessions;
            }
        },
    methods: {
        deleteSession(data, ev) {
            if (ev != null) {
                ev.stopPropagation();
                ev.preventDefault();
            }
            let activeNode = this.$refs.sessionsTree.tree.activeNode;
            axios.post(
                'http://' + window.location.host + '/api/session/delete',
                {
                    sessionId: activeNode.id,
                    sessionPath: activeNode.id,
                }
            ).then(response => {
                if (response.data === true) {
                    console.log('success');
                    // this.$refs.sessionsTree.deleteActiveNode();
                }
            });
        },
        openSession() {
            let activeNode = this.$refs.sessionsTree.tree.activeNode;
            let panelData = {
                type: 'session-info-panel',
                title: 'Info',
                data: activeNode.id,
                checkIfAlreadyOpen: true,
            };
            // this.$store.commit('setSessionId', activeNode.id);
            this.$store.dispatch('showPanel', panelData);
        },
        createNewSession(data, ev) {
            ev.stopPropagation();
            ev.preventDefault();
            axios.post(
                'http://' + window.location.host + '/api/session/create'
            ).then(response => {
                // if (response.data === true) {
                //     let newNode = {
                //         title: 'Untitled.jtt',
                //     };
                //     closestFolder.children.push(newNode);
                //     closestFolder.component.expanded = true;
                //     this.$nextTick(function() {
                //         this.$refs.tree.setActiveNode(newNode);
                //         this.renameActiveNode('', null);
                //     });
                // }
            });
        },
        renameSession(data, ev) {
            if (ev != null) {
                ev.stopPropagation();
                ev.preventDefault();
            }
            let activeNode = this.$refs.tree.tree.activeNode;
            activeNode.component.editing = true;
            this.$nextTick(function() {
                activeNode.component.$refs.editor.focus();
                activeNode.component.$refs.editor.select();
            });
        },

        fetchData() {
            this.loading = true;
            this.$store.state.sessions.splice(0, this.$store.state.sessions.length);
            axios
            .get('http://' + window.location.host + '/api/sessions')
            .then(response => {
                for (let i=0; i<response.data.length; i++) {
                    this.$store.state.sessions.push(response.data[i]);
                }
                this.loading = false;
            });
        },
    },
}
</script>

<style scoped>

</style>