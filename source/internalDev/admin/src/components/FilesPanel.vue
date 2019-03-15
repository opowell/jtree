<template>
  <div>
    <action-bar
      :menus='actions'>
    </action-bar>
    <div style='padding-top: 10px; padding-bottom: 10px; background-color: #444; flex: 1 1 auto'>
        <jt-tree ref='tree'
            :nodesProp='nodes'
        >
        </jt-tree>
    </div>
  </div>
</template>
<script>
  import axios from 'axios';

// import { library } from '@fortawesome/fontawesome-svg-core';
// import {
//   faCaretRight, faCaretDown, faTable, faImage, faFile, faCircle, faCode, faFolder, faFolderOpen
// } from '@fortawesome/free-solid-svg-icons';
// import { faJs, } from '@fortawesome/free-brands-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
// library.add(faJs, faCaretRight, faCaretDown, faTable, faImage, faFile, faCircle, faCode, faFolder, faFolderOpen);

// import LiquorTree from 'liquor-tree'
import JtTree from '@/components/JtTree.vue'
import ActionBar from '@/components/ActionBar.vue'

  export default {
      name: 'FilesPanel',
      components: {
        // 'font-awesome-icon': FontAwesomeIcon,
        // 'liquor-tree': LiquorTree,
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
                    icon: 'fas fa-font'
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
                    icon: 'fas fa-trash'
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
          this.$store.state.session.gameTree.push(selection[i]);
        }
      },
        fetchData() {
            this.loading = true
            axios
            .get('http://' + window.location.host + '/api/files')
            .then(response => {
                this.nodes = response.data;
                this.loading = false;
            });
        },
        nodeDoubleClick(node, event) {
            // console.log(`nodeDoubleClick ${node.title} ${node.data.type} isLeaf ${node.isLeaf} ${util.inspect(node)}`);
            event.preventDefault();
            if (!node.isLeaf) {
                this.nodes[node.path].isExpanded = !this.nodes[node.path].isExpanded;
                // this.$refs.slvuetree.onToggleHandler(event, node);
                // return;
            }
            // this.$emit('nodeDoubleClick', node);
        },
    //   showContextMenu(node, event) {
    //     event.preventDefault();
    //     this.contextMenuIsVisible = true;
    //     const $contextMenu = document.querySelector('.contextmenu');
    //     $contextMenu.style.left = event.clientX + 'px';
    //     $contextMenu.style.top = event.clientY + 'px';
    //   },
      showContextMenu(node, event) {
        event.preventDefault();
        this.contextMenuIsVisible = true;
        const $contextMenu = this.$refs.contextmenu;
        $contextMenu.style.left = (event.clientX) + 'px';
        $contextMenu.style.top = (event.clientY) + 'px';
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