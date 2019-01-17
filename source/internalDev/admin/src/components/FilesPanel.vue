<template>
  <div>
    <action-bar
      :menus='actions'>
    </action-bar>
    <div>
        <input type="file" id="file" ref="file" @change="handleFileUpload()"/>
        <button @click="uploadFile()">Submit</button>
    </div>
    <div style='padding-top: 10px; padding-bottom: 10px; background-color: rgb(37, 37, 37); flex: 1 1 auto; align-self: stretch'>
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
                file: '',
                actions: [
                {
                    title: 'New file',
                    hasParent: false,
                    icon: 'far fa-file',
                    action: this.createNewFile,
                },
                {
                    title: 'New folder',
                    hasParent: false,
                    icon: 'far fa-folder',
                    action: this.createNewFolder,
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
                    title: 'Open',
                    hasParent: false,
                    icon: 'fas fa-play',
                    action: this.addSelectedNodeToGameTree,
                },
                {
                    title: 'Delete',
                    hasParent: false,
                    icon: 'fas fa-trash',
                    action: this.deleteFile,
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
        getClosestFolder(node) {
            let out = node;
            while (out != null && out.children == null && out.parentNode != null) {
                out = out.parentNode;
            }
            return out;
        },
        deleteFile(data, ev) {
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
        createNewFile(data, ev) {
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
        createNewFolder(data, ev) {
            ev.stopPropagation();
            ev.preventDefault();
            let activeNode = this.$refs.tree.tree.activeNode;
            let closestFolder = this.getClosestFolder(activeNode);
            if (closestFolder != null) {
                let parentPath = this.getParentPath(closestFolder);
                parentPath.push(closestFolder.title);
                axios.post(
                    'http://' + window.location.host + '/api/file/createFolder',
                    {
                        path: parentPath,
                        newName: 'Untitled',
                    }
                ).then(response => {
                    if (response.data === true) {
                        let newNode = {
                            title: 'Untitled',
                            children: [],
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
        getParentPath(node) {
            let out = [];
            let parentNode = node.parentNode;
            while (parentNode.isNode !== false) {
                out.unshift(parentNode.title);
                if (parentNode.rootPath != null) {
                    out.unshift(parentNode.rootPath);
                }
                parentNode = parentNode.parentNode;
            }
            return out;
        },
        renameActiveNode(data, ev) {
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

        handleFileUpload() {
            this.file = this.$refs.file.files[0];
        },

        uploadFile() {
            let activeNode = this.$refs.tree.tree.activeNode;
            let closestFolder = this.getClosestFolder(activeNode);
            if (closestFolder != null) {
                let parentPath = this.getParentPath(closestFolder);
                parentPath.push(closestFolder.title);
                let formData = new FormData();
                formData.append('file', this.file);
                formData.append('folderPath', parentPath);
                axios.post('http://' + window.location.host + '/api/file/upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
                ).then(function(){
                console.log('SUCCESS!!');
                })
                .catch(function(){
                console.log('FAILURE!!');
                });
            }
        },

        fetchData() {
            this.loading = true;
            this.nodes.splice(0, this.nodes.length);
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