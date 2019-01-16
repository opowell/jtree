<template>
  <div>
    <action-bar
      :menus='actions'>
    </action-bar>
    <div style='padding-top: 10px; padding-bottom: 10px; background-color: rgb(37, 37, 37); flex: 1 1 auto'>
        <jt-tree ref='tree'
            :nodesProp='nodes'
            :f2Func='renameActiveNode'
        >
        </jt-tree>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
import JtTree from '@/components/JtTree.vue'
import ActionBar from '@/components/ActionBar.vue'

export default {
        name: 'FilesPanel',
        components: {
            'jt-tree': JtTree,
            'action-bar': ActionBar,
        },
        props: ['dat'],
        data() {
            return {
                contextMenuIsVisible: true,
                loading: true,
                nodes: [],
                actions: [
                {
                    title: 'New file',
                    hasParent: false,
                    icon: 'far fa-file',
                }, 
                {
                    title: 'New folder',
                    hasParent: false,
                    icon: 'far fa-folder',
                },
                {
                    title: 'Upload file(s)...',
                    hasParent: false,
                    icon: 'fas fa-upload',
                },
                {
                    title: 'Add root folder',
                    hasParent: false,
                    icon: 'fas fa-plus',
                },
                'divider',
                {
                    title: 'Rename',
                    hasParent: false,
                    icon: 'fas fa-font',
                    action: this.renameActiveNode,
                },
                {
                    title: 'Open',
                    hasParent: false,
                    icon: 'fas fa-play',
                    action: this.addSelectedNodeToGameTree,
                },
                {
                    title: 'Delete',
                    hasParent: false,
                    icon: 'fas fa-trash',
                },
                ],
            }
        },
        created() {
            this.fetchData();
        },
    methods: {
        addSelectedNodeToGameTree() {
            let selection = this.$refs.tree.tree.selection;
            for (let i=0; i<selection.length; i++) {
                console.log('play ' + selection[i].title);
                let newNode = {
                    title: selection[i].title,
                }
                if (selection[i].children != null) {
                    newNode.children = selection[i].children;
                }
                this.$store.state.session.gameTree.push(newNode);
            }
        },
        renameActiveNode(ev) {
            ev.stopPropagation();
            ev.preventDefault();
            let activeNode = this.$refs.tree.tree.activeNode;
            activeNode.component.editing = true;
            this.$nextTick(function() {
                activeNode.component.$refs.editor.focus();
                activeNode.component.$refs.editor.select();
            });
        },
        fetchData() {
            this.loading = true
            axios
            .get('http://' + window.location.host + '/api/files')
            .then(response => {
                this.nodes.push(response.data);
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

  .contextmenu {
    position: absolute;
    background-color: white;
    color: black;
    border-radius: 2px;
    cursor: pointer;
  }
  .contextmenu > div {
    padding: 10px;
  }
  .contextmenu > div:hover {
    background-color: rgba(100, 100, 255, 0.5);
  }

</style>