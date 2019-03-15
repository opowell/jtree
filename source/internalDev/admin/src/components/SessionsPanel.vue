<template>
  <div>
    <action-bar
      :menus='actions'>
    </action-bar>
    <div style='flex: 1 1 auto; align-self: stretch'>
        <div class="loading" v-if="loading">
        Loading...
        </div>
        <div 
            v-else
            v-for='session in sessions'
            :key='session.id'
            @dblclick.left.prevent.stop='openSession(session.id)'
        >
            {{session.id}}
        </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
import ActionBar from '@/components/ActionBar.vue'

export default {
        name: 'SessionsPanel',
        components: {
            'action-bar': ActionBar,
        },
        props: ['dat'],
        data() {
            return {
                contextMenuIsVisible: true,
                loading: true,
                sessions: [],
                actions: [
                {
                    title: 'New file',
                    hasParent: false,
                    icon: 'far fa-file',
                    action: this.createNewFile,
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
        created() {
            this.fetchData();
        },
    methods: {
        deleteSession(data, ev) {
            ev.stopPropagation();
            ev.preventDefault();
            let activeNode = this.$refs.tree.tree.activeNode;
            let parentPath = this.getParentPath(activeNode);
            parentPath.push(activeNode.title);
            axios.post(
                'http://' + window.location.host + '/api/file/delete',
                {
                    path: parentPath,
                }
            ).then(response => {
                if (response.data === true) {
                    activeNode.parentNode.children.splice(activeNode.indexOnParent, 1);
                    this.$refs.tree.setActiveNode(null);
                }
            });
        },
        openSession(id) {
            axios
            .get('http://' + window.location.host + '/api/session')
            .then(response => {
                this.showPanel('session-info-panel', response.data);
            });
        },
        createNewSession(data, ev) {
            ev.stopPropagation();
            ev.preventDefault();
            let activeNode = this.$refs.tree.tree.activeNode;
            let closestFolder = this.getClosestFolder(activeNode);
            if (closestFolder != null) {
                let parentPath = this.getParentPath(closestFolder);
                parentPath.push(closestFolder.title);
                axios.post(
                    'http://' + window.location.host + '/api/file/create',
                    {
                        path: parentPath,
                        newName: 'Untitled.jtt',
                    }
                ).then(response => {
                    if (response.data === true) {
                        let newNode = {
                            title: 'Untitled.jtt',
                        };
                        closestFolder.children.push(newNode);
                        closestFolder.component.expanded = true;
                        this.$nextTick(function() {
                            this.$refs.tree.setActiveNode(newNode);
                            this.renameActiveNode('', null);
                        });
                    }
                });
            }
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
            this.sessions.splice(0, this.sessions.length);
            axios
            .get('http://' + window.location.host + '/api/sessions')
            .then(response => {
                for (let i=0; i<response.data.length; i++) {
                    this.sessions.push(response.data[i]);
                }
                this.loading = false;
            });
        },
    },
}
</script>

<style scoped>
.table thead th {
    border-bottom: none;    
}

.table td, .table th {
    border: none;
}

.form-control {
    font-size: inherit;
}
</style>