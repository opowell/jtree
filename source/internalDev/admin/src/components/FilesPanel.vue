<template>
    <div>
        <div class="loading" v-if="loading">
        Loading...
        </div>
        <sl-vue-tree 
            v-model="nodes"
            @nodedblclick="nodeDoubleClick"
            @nodecontextmenu="showContextMenu"
            ref="slVueTree"
        >
            <template slot="toggle">
                <div></div>
            </template>

            <template slot="title" slot-scope="{ node }">
                <font-awesome-icon 
                    :icon="[ 'fab', 'js' ]" 
                    v-if='node.data.type === "application/javascript"'></font-awesome-icon>
                <font-awesome-icon 
                    icon="table" 
                    v-else-if='node.data.type === "application/json"'></font-awesome-icon>
                <font-awesome-icon 
                    icon="image" 
                    v-else-if='node.data.type === "IMAGE"'></font-awesome-icon>
                <font-awesome-icon 
                    icon="file" 
                    v-else-if="node.isLeaf"></font-awesome-icon>
                <font-awesome-icon 
                    icon="folder" 
                    v-else-if="!node.isLeaf && !node.isExpanded"></font-awesome-icon>
                <font-awesome-icon 
                    icon="folder-open" 
                    v-else-if="!node.isLeaf && node.isExpanded"></font-awesome-icon>
                {{ node.title }} 
            </template>
        </sl-vue-tree>

    <div class="contextmenu" ref="contextmenu" v-show="contextMenuIsVisible">
      <div>Remove</div>
    </div>

    </div>
</template>
<script>
  import axios from 'axios';
  import SLVueTree from 'sl-vue-tree';

import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faCaretRight, faCaretDown, faTable, faImage, faFile, faCircle, faCode, faFolder, faFolderOpen
} from '@fortawesome/free-solid-svg-icons';
import { faJs, } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
library.add(faJs, faCaretRight, faCaretDown, faTable, faImage, faFile, faCircle, faCode, faFolder, faFolderOpen);

  export default {
      name: 'FilesPanel',
      components: {
        'sl-vue-tree': SLVueTree,
        'font-awesome-icon': FontAwesomeIcon
        },
      props: ['dat'],
      data() {
          return {
              contextMenuIsVisible: true,
              loading: true,
              nodes: [],
              menus: [
                {
                    text: 'Start',
          hasParent: false,
                }, 
                {
                    text: 'New',
          hasParent: false,
                },
              ],
          }
      },
      created() {
          this.fetchData();
      },
    methods: {
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
        $contextMenu.style.left = (event.clientX - this.$refs.slVueTree.$el.offsetWidth) + 'px';
        $contextMenu.style.top = (event.clientY - this.$refs.slVueTree.$el.offsetHeight) + 'px';
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