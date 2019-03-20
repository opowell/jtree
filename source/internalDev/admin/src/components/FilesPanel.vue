<template>
  <div>
    <action-bar
      :menus='actions'>
    </action-bar>
    <div style='flex: 1 1 auto; align-self: stretch; overflow: auto'>
        <input
            id='fileSelect'
            type="file"
            style='display: none;'
            multiple
            class='icon'
            ref="fileSelect"
            @change="uploadFiles"
        />

        <jt-tree ref='tree'
            :nodesProp='nodes'
            :f2Func='renameActiveNode'
            :dblClickFunc='addSelectedNodeToGameTree'
            @deleteNode='deleteFile'
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
        props: [
            'dat',
            'panel',
        ],
        data() {
            return {
                contextMenuIsVisible: true,
                loading: true,
                nodes: [],
                panelTitle: 'Files',
                files: [],
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
                    action: this.chooseFiles,
                    ref: 'fileSelectIcon',
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
                    title: 'Add to Game Tree',
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
        mounted() {
            this.panel.id = 'Files';
        },
    methods: {
        chooseFiles() {
            document.getElementById('fileSelect').click();
        },
        checkIfTarget(ev) {
            if (ev.target !== this.$refs.fileSelect) {
                ev.preventDefault();
            }
        },
        openSelectedFileAsSession() {
            let activeNode = this.$refs.tree.activeNode();
            let filePath = this.getParentPath(activeNode);
            filePath.push(activeNode.title);

            let options = {};
            var d = {
                filePath: filePath,
                sId: this.$store.state.sessionId,
                options: options
            };
            global.jt.socket.emit('openGameAsSession', d);
        },
        addSelectedNodeToGameTree() {
            let activeNode = this.$refs.tree.activeNode();
            let filePath = this.getParentPath(activeNode);
            filePath.push(activeNode.title);

            let options = {};
            var d = {
                filePath: filePath,
                sId: this.$store.state.sessionId,
                options: options
            };
            global.jt.socket.emit('sessionAddGame', d);
            // axios.post(
            //     'http://' + window.location.host + '/api/session/addGame',
            //     {
            //         filePath: filePath,
            //     }
            // ).then(response => {
            //     if (response.data.success === true) {
            //         let game = response.data.game;
            //         let newNode = {
            //             title: game.appFilename,
            //             children: [],
            //             data: game,
            //         }
            //         for (let i=0; i<game.functions.length; i++) {
            //             newNode.children.push({
            //                 title: game.functions[i].field,
            //                 data: game.functions[i].content,
            //             })
            //         }
            //         for (let i=0; i<game.subgames.length; i++) {
            //             let subgame = game.subgames[i];
            //             newNode.children.push(this.getGameAsNode(subgame));
            //         }
            //         this.$store.state.session.gameTree.push(newNode);
            //     }
            // });
        },
        getGameAsNode(game) {
            let out = {
                title: game.id,
                children: [],
                data: game,
            };
            // if (game.activeScreen != null) {
            //     out.children.push({
            //         title: 'Active screen',
            //     });
            // }
            for (let i=0; i<game.subgames.length; i++) {
                out.children.push(this.getGameAsNode(game.subgames[i]));
            }
            return out;
        },
        getClosestFolderNode(node) {
            let out = node;
            while (out != null && out.children == null && out.parentNode != null) {
                out = out.parentNode;
            }
            return out;
        },
        deleteFile(data, ev) {
            if (ev != null) {
                ev.stopPropagation();
                ev.preventDefault();
            }
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
                    this.$refs.tree.deleteActiveNode();
                }
            });
        },
        folderContainsFile(node, filename) {
            for (let i=0; i<node.children.length; i++) {
                if (node.children[i].title === filename) {
                    return true;
                }
            }
            return false;
        },
        createNewFile(data, ev) {
            ev.stopPropagation();
            ev.preventDefault();
            let activeNode = this.$refs.tree.tree.activeNode;
            let closestFolder = this.getClosestFolderNode(activeNode);
            if (closestFolder != null) {
                let parentPath = this.getParentPath(closestFolder);
                let i = null;
                parentPath.push(closestFolder.title);
                let fullFilename = 'Untitled' + (i === null ? '' : '[' + i + ']') + '.jtt';
                // eslint-disable-next-line
                while (true) {
                    fullFilename = 'Untitled' + (i === null ? '' : '[' + i + ']') + '.jtt';
                    if (this.folderContainsFile(closestFolder, fullFilename)) {
                        if (i === null) {
                            i = 1;
                        } else {
                            i++;
                        }
                    } else {
                        break;
                    }
                }
                axios.post(
                    'http://' + window.location.host + '/api/file/create',
                    {
                        path: parentPath,
                        newName: fullFilename,
                    }
                ).then(response => {
                    if (response.data === true) {
                        let newNode = {
                            title: fullFilename,
                        };
                        closestFolder.children.push(newNode);
                        closestFolder.component.expanded = true;
                        this.$nextTick(function() {
                            this.$refs.tree.setActiveNode(newNode);
                            this.$nextTick(function() {
                                this.renameActiveNode('', null);
                            });
                        });
                    }
                });
            }
        },
        createNewFolder(data, ev) {
            ev.stopPropagation();
            ev.preventDefault();
            let activeNode = this.$refs.tree.tree.activeNode;
            let closestFolder = this.getClosestFolderNode(activeNode);
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
                            this.$nextTick(function() {
                                this.renameActiveNode('', null);
                            });
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

        uploadFiles() {
            this.files = this.$refs.fileSelect.files;
            let activeNode = this.$refs.tree.tree.activeNode;
            let closestFolder = this.getClosestFolderNode(activeNode);
            if (closestFolder != null) {
                let parentPath = this.getParentPath(closestFolder);
                parentPath.push(closestFolder.title);
                let formData = new FormData();
                for( var i = 0; i < this.files.length; i++ ){
                    let file = this.files[i];
                    formData.append('files[' + i + ']', file);
                }
                formData.append('folderPath', parentPath);
                formData.append('numFiles', this.files.length);
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

 .input-file {
    opacity: 0; /* invisible but it's there! */
    width: 100%;
    height: 200px;
    position: absolute;
    cursor: pointer;
  }
</style>